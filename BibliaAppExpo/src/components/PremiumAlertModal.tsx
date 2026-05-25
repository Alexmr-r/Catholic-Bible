import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../theme/colors';

export interface PremiumAlertAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface PremiumAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  actions: PremiumAlertAction[];
  onDismiss: () => void;
}

const PremiumAlertModal: React.FC<PremiumAlertModalProps> = ({
  visible,
  title,
  message,
  icon = 'info-outline',
  actions,
  onDismiss,
}) => {
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
      hardwareAccelerated
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <MaterialIcons name={icon} size={32} color={colors.primary.DEFAULT} />
              </View>

              {/* Text */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                {actions.map((action, index) => {
                  const isCancel = action.style === 'cancel';
                  const isDestructive = action.style === 'destructive';
                  
                  let buttonStyle = [styles.button];
                  let textStyle = [styles.buttonText];

                  if (isCancel) {
                    buttonStyle.push(styles.buttonCancel);
                    textStyle.push(styles.buttonTextCancel);
                  } else if (isDestructive) {
                    buttonStyle.push(styles.buttonDestructive);
                    textStyle.push(styles.buttonTextDestructive);
                  } else {
                    buttonStyle.push(styles.buttonPrimary);
                    textStyle.push(styles.buttonTextPrimary);
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[buttonStyle, { marginLeft: index > 0 ? 12 : 0 }]}
                      onPress={() => {
                        onDismiss();
                        setTimeout(() => action.onPress(), 100); // Slight delay for animation
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={textStyle}>{action.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: isDarkMode ? '#FFFFFF' : '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 15,
    fontWeight: '400',
    color: isDarkMode ? '#AEAEB2' : '#636366',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
  },
  buttonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: isDarkMode ? '#FFFFFF' : '#1C1C1E',
  },
  buttonPrimary: {
    backgroundColor: colors.primary.DEFAULT,
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: isDarkMode ? '#1C1C1E' : '#FFFFFF',
  },
  buttonDestructive: {
    backgroundColor: colors.burgundy.DEFAULT,
  },
  buttonTextDestructive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PremiumAlertModal;
