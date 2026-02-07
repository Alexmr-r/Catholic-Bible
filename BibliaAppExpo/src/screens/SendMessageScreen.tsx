/**
 * PANTALLA DE ENVIAR MENSAJE A SOPORTE
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';

const SendMessageScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa un asunto.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Campo requerido', 'Por favor escribe tu mensaje.');
      return;
    }

    try {
      setIsSending(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert(
        '✅ Mensaje enviado',
        'Hemos recibido tu mensaje. Te responderemos pronto.',
        [{text: 'Aceptar', onPress: () => navigation.goBack()}]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.charcoal.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enviar Mensaje</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.iconSection}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="mail-outline" size={32} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.iconTitle}>Estamos para ayudarte</Text>
            <Text style={styles.iconSubtitle}>Cuéntanos tus dudas o comentarios y te responderemos pronto.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ASUNTO</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="label-outline" size={20} color={colors.gold.DEFAULT + '80'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="¿Sobre qué trata tu mensaje?"
                  placeholderTextColor={colors.charcoal.muted}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>MENSAJE</Text>
              <View style={[styles.inputContainer, styles.textareaContainer]}>
                <MaterialIcons name="chat-bubble-outline" size={20} color={colors.gold.DEFAULT + '80'} style={styles.textareaIcon} />
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Escribe aquí tu mensaje detallado..."
                  placeholderTextColor={colors.charcoal.muted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={isSending}
              activeOpacity={0.8}>
              <Text style={styles.sendButtonText}>{isSending ? 'Enviando...' : 'Enviar Mensaje'}</Text>
              <MaterialIcons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" size={20} color={colors.gold.DEFAULT} />
            <Text style={styles.infoText}>Recibirás una notificación en tu correo electrónico una vez hayamos revisado tu caso.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.cream},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.cream},
  backButton: {width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center'},
  headerTitle: {fontSize: 18, fontWeight: '600', color: colors.charcoal.DEFAULT, fontFamily: 'serif'},
  headerSpacer: {width: 40},
  keyboardView: {flex: 1},
  content: {flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100, justifyContent: 'space-between'},
  iconSection: {alignItems: 'center', marginBottom: 24},
  iconContainer: {width: 64, height: 64, borderRadius: 32, backgroundColor: colors.gold.DEFAULT + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 16},
  iconTitle: {fontSize: 18, fontWeight: '600', color: colors.charcoal.DEFAULT, fontFamily: 'serif', marginBottom: 6},
  iconSubtitle: {fontSize: 14, color: colors.charcoal.muted, textAlign: 'center', lineHeight: 20},
  form: {flex: 1, gap: 20, justifyContent: 'center'},
  inputGroup: {gap: 8},
  inputLabel: {fontSize: 10, fontWeight: '600', letterSpacing: 2, color: colors.charcoal.muted, paddingLeft: 4},
  inputContainer: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: colors.ivory.border, paddingHorizontal: 16},
  inputIcon: {marginRight: 12},
  input: {flex: 1, fontSize: 15, color: colors.charcoal.DEFAULT, paddingVertical: 16},
  textareaContainer: {alignItems: 'flex-start', paddingTop: 16},
  textareaIcon: {marginTop: 2, marginRight: 12},
  textarea: {minHeight: 140, paddingTop: 0},
  sendButton: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.burgundy.DEFAULT, paddingVertical: 16, borderRadius: 16, marginTop: 8, shadowColor: colors.burgundy.DEFAULT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4},
  sendButtonDisabled: {opacity: 0.7},
  sendButtonText: {fontSize: 15, fontWeight: '600', color: '#FFFFFF'},
  infoBox: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.cream, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold.DEFAULT + '30', padding: 20, marginTop: 24},
  infoText: {flex: 1, fontSize: 13, color: colors.charcoal.muted, lineHeight: 18},
});

export default SendMessageScreen;
