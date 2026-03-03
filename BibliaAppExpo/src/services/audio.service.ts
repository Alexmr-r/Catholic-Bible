import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// Importar Sherpa-ONNX (módulos nativos expo-dev-client)
let SherpaTTS: any = null;
try {
    const SherpaPkg = require('react-native-sherpa-onnx-offline-tts');
    SherpaTTS = SherpaPkg.default || SherpaPkg;
    console.log('[AudioService] Sherpa-ONNX módulo cargado correctamente');
} catch (e) {
    console.log('[AudioService] Sherpa-ONNX no disponible en este entorno');
}

export interface AudioStatus {
    isSpeaking: boolean;
    isPaused?: boolean;
    readProgress?: number;
    currentText?: string;
    voiceName?: string;
    isDownloading?: boolean;
    downloadProgress?: number;
    engineType: 'native' | 'ai-local';
}

const MODEL_BASE_URL = 'https://huggingface.co/csukuangfj/vits-ljs/resolve/main/';
const MODEL_FILES = {
    model: 'vits-ljs.onnx',
    tokens: 'tokens.txt',
    lexicon: 'lexicon.txt'
};

class AudioService {
    private isSpeaking: boolean = false;
    private currentVoiceName: string = 'Voz Nativa';
    private onStatusChange?: (status: AudioStatus) => void;
    private engineType: 'native' | 'ai-local' = 'native';

    private isDownloading: boolean = false;
    private downloadProgress: number = 0;
    private isTtsInitialized: boolean = false;
    private isPaused: boolean = false;
    private readProgress: number = 0;

    constructor() {
        if (SherpaTTS && SherpaTTS.addVolumeListener) {
            SherpaTTS.addVolumeListener((volume: number) => {
                if (volume === -1.0 && this.isSpeaking) {
                    console.log('[AudioService] Playback finished detected via Volume -1');
                    this.isSpeaking = false;
                    this.isPaused = false;
                    this.readProgress = 0;
                    this.notify();
                }
            });
        }
        if (SherpaTTS && SherpaTTS.addProgressListener) {
            SherpaTTS.addProgressListener((progress: number) => {
                this.readProgress = progress;
                this.notify();
            });
        }
    }

    private getBaseDir() {
        const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
        if (docDir.endsWith('/')) {
            return docDir;
        }
        return docDir + '/';
    }

    private getModelDir() {
        return `${this.getBaseDir()}models/vits-ljs/`;
    }

    private getModelPath() {
        return `${this.getModelDir()}${MODEL_FILES.model}`;
    }

    private getTokensPath() {
        return `${this.getModelDir()}${MODEL_FILES.tokens}`;
    }

    private getLexiconPath() {
        return `${this.getModelDir()}${MODEL_FILES.lexicon}`;
    }

    private notify() {
        if (this.onStatusChange) {
            this.onStatusChange(this.getStatus());
        }
    }

    subscribe(callback: (status: AudioStatus) => void) {
        this.onStatusChange = callback;
        this.notify();
    }

    unsubscribe() {
        this.onStatusChange = undefined;
    }

    getStatus(): AudioStatus {
        return {
            isSpeaking: this.isSpeaking,
            isPaused: this.isPaused,
            readProgress: this.readProgress,
            voiceName: this.currentVoiceName,
            engineType: this.engineType,
            downloadProgress: this.downloadProgress,
            isDownloading: this.isDownloading
        };
    }

    async checkModelExists(): Promise<boolean> {
        try {
            const mPath = this.getModelPath();
            const tPath = this.getTokensPath();
            const lPath = this.getLexiconPath();
            const modelInfo = await FileSystem.getInfoAsync(mPath);
            const tokensInfo = await FileSystem.getInfoAsync(tPath);
            const lexiconInfo = await FileSystem.getInfoAsync(lPath);

            // Verificación básica de que no sean archivos de error o vacíos
            if (modelInfo.exists && modelInfo.size < 1024) {
                console.log('[AudioService] Detectado modelo corrupto (muy pequeño), eliminando...');
                await FileSystem.deleteAsync(this.getModelDir(), { idempotent: true });
                return false;
            }

            return modelInfo.exists && tokensInfo.exists && lexiconInfo.exists;
        } catch (error) {
            return false;
        }
    }

    async downloadModel(): Promise<boolean> {
        if (this.isDownloading) return false;

        try {
            this.isDownloading = true;
            this.notify();

            const modelDir = this.getModelDir();
            const dirInfo = await FileSystem.getInfoAsync(modelDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
            }

            await this.downloadFile(MODEL_FILES.model, this.getModelPath());
            await this.downloadFile(MODEL_FILES.tokens, this.getTokensPath());
            await this.downloadFile(MODEL_FILES.lexicon, this.getLexiconPath());

            this.isDownloading = false;
            this.notify();
            return true;
        } catch (error) {
            console.error('[AudioService] Error en descarga:', error);
            this.isDownloading = false;
            this.notify();
            return false;
        }
    }

    private async downloadFile(filename: string, destination: string) {
        const downloadResumable = FileSystem.createDownloadResumable(
            `${MODEL_BASE_URL}${filename}?download=true`,
            destination,
            {},
            (progress) => {
                this.downloadProgress = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
                this.notify();
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (!result) throw new Error(`Error descargando ${filename}`);
    }

    async speak(text: string, title?: string, forceEngine?: 'native' | 'ai-local') {
        try {
            await this.stop(); // Stop any previous playback

            const modelExists = await this.checkModelExists();

            if (forceEngine === 'native') {
                await this.speakNative(text, title);
            } else if (forceEngine === 'ai-local') {
                if (modelExists && SherpaTTS) {
                    await this.speakLocal(text, title);
                } else {
                    console.log('[AudioService] Se pidió IA pero no existe el modelo. Usando nativo.');
                    await this.speakNative(text, title);
                }
            } else {
                // Default fallback logic si no se especifica fuerza
                if (modelExists && SherpaTTS) {
                    await this.speakLocal(text, title);
                } else {
                    await this.speakNative(text, title);
                }
            }
        } catch (error) {
            console.error('[AudioService] Error al iniciar lectura:', error);
            this.isSpeaking = false;
            this.isPaused = false;
            this.notify();
        }
    }

    private async speakLocal(text: string, title?: string) {
        if (!SherpaTTS) return this.speakNative(text, title);

        try {
            const cleanText = this.prepareText(text, title);

            const config = JSON.stringify({
                modelPath: this.getModelPath().replace('file://', ''),
                tokensPath: this.getTokensPath().replace('file://', ''),
                lexiconPath: this.getLexiconPath().replace('file://', ''),
                dataDirPath: ''
            });

            console.log('[AudioService] Inicializando Sherpa TTS...');
            await SherpaTTS.initialize(config);

            this.engineType = 'ai-local';
            this.currentVoiceName = 'Narrador Premium IA';
            this.isSpeaking = true;
            this.isPaused = false;
            this.readProgress = 0;
            this.notify();

            console.log('[AudioService] Ejecutando generateAndPlay...');
            // Enviamos el texto normal
            await SherpaTTS.generateAndPlay(cleanText, 0, 1.0);

            // El motor nativo de esta lib no tiene callback de 'onDone', 
            // así que el estado se quedará en 'isSpeaking' hasta que el usuario pare o inicie otro.
        } catch (e: any) {
            console.log('[AudioService] Error capturado en IA:', e?.message || e);

            this.isSpeaking = false;
            this.notify();

            const errCode = e?.code || '';
            const errStr = String(e?.message || e);

            if (errCode === 'STOPPED' || errStr.includes('STOPPED') || errStr.includes('Playback stopped')) {
                console.log('[AudioService] Lectura cancelada por el usuario (X).');
                return;
            }

            if (errCode === 'BUSY' || errStr.includes('already generating')) {
                console.log('[AudioService] Petición duplicada ignorada.');
                return;
            }

            console.log('[AudioService] Reintentando con voz nativa debido a error real en IA...');
            return this.speakNative(text, title);
        }
    }

    private async speakNative(text: string, title?: string) {
        const cleanText = this.prepareText(text, title);
        this.engineType = 'native';
        this.currentVoiceName = 'Voz Nativa';
        this.isPaused = false;
        this.readProgress = 0;

        const options: Speech.SpeechOptions = {
            language: 'es-ES',
            rate: 0.9,
            onStart: () => {
                this.isSpeaking = true;
                this.notify();
            },
            onDone: () => {
                this.isSpeaking = false;
                this.notify();
            },
            onStopped: () => {
                this.isSpeaking = false;
                this.notify();
            }
        };

        await Speech.speak(cleanText, options);
    }

    async stop() {
        console.log('[AudioService] Deteniendo todo el audio...');
        try {
            // Detener voz nativa
            await Speech.stop();

            // Detener Sherpa-ONNX sin desinicializar (evita race conditions)
            if (SherpaTTS && SherpaTTS.stop) {
                await SherpaTTS.stop();
                console.log('[AudioService] Sherpa-ONNX playback detenido');
            }

            this.isSpeaking = false;
            this.isPaused = false;
            this.readProgress = 0;
            this.notify();
        } catch (error) {
            console.error('[AudioService] Error al detener:', error);
            this.isSpeaking = false;
            this.isPaused = false;
            this.notify();
        }
    }

    async pause() {
        if (!this.isSpeaking || this.isPaused) return;

        try {
            if (this.engineType === 'native') {
                await Speech.pause();
            } else if (SherpaTTS && SherpaTTS.pause) {
                SherpaTTS.pause();
            }
            this.isPaused = true;
            this.notify();
        } catch (error) {
            console.error('[AudioService] Error al pausar:', error);
        }
    }

    async resume() {
        if (!this.isSpeaking || !this.isPaused) return;

        try {
            if (this.engineType === 'native') {
                await Speech.resume();
            } else if (SherpaTTS && SherpaTTS.resume) {
                SherpaTTS.resume();
            }
            this.isPaused = false;
            this.notify();
        } catch (error) {
            console.error('[AudioService] Error al reanudar:', error);
        }
    }

    // Método para liberar recursos completamente si es necesario (ej: cierre de app)
    async release() {
        try {
            if (SherpaTTS) {
                await SherpaTTS.deinitialize();
                this.isTtsInitialized = false;
            }
        } catch (e) {
            console.error('[AudioService] Error al liberar:', e);
        }
    }

    private prepareText(text: string, title?: string): string {
        let result = title ? `${title}. ` : '';
        const processedText = text
            .replace(/^\d+\.\s/gm, '')
            .replace(/\s\d+\.\s/g, '. ')
            .replace(/\n/g, '. ')
            .replace(/\[.*?\]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        return result + processedText;
    }


}

export const audioService = new AudioService();
