import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Lock, Mail, Key, ArrowRight } from 'lucide-react-native';
import { sendOtp, verifyOtp, signInWithMagicLink } from '../services/authService';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

export const AuthScreen = ({ onLoginSuccess }: AuthScreenProps) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    const resp = await sendOtp(email);
    if (resp.success) {
      setStep('otp');
    } else {
      setError(resp.error || 'Failed to send code');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return;
    setLoading(true);
    setError('');
    const resp = await verifyOtp(email, otp);
    if (resp.success && resp.session_url) {
      const signInResp = await signInWithMagicLink(resp.session_url);
      if (signInResp.success) {
        onLoginSuccess();
      } else {
        setError(signInResp.error || 'Session creation failed');
      }
    } else {
      setError(resp.error || 'Invalid code');
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <Lock color="#18181b" size={24} />
          </View>

          <Text style={styles.title}>{step === 'email' ? 'Get Started' : 'Verify Code'}</Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? 'Enter your email to receive a secure access code'
              : `We sent a 6-digit code to ${email}`}
          </Text>

          <View style={styles.inputContainer}>
            {step === 'email' ? (
              <View style={styles.inputWrapper}>
                <Mail color="#71717a" size={18} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#3f3f46"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            ) : (
              <View style={styles.inputWrapper}>
                <Key color="#71717a" size={18} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="6-digit code"
                  placeholderTextColor="#3f3f46"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  editable={!loading}
                />
              </View>
            )}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, (!email && step === 'email') || (otp.length < 6 && step === 'otp') ? styles.buttonDisabled : null]}
            onPress={step === 'email' ? handleSendOtp : handleVerifyOtp}
            disabled={loading || (!email && step === 'email') || (otp.length < 6 && step === 'otp')}
          >
            {loading ? (
              <ActivityIndicator color="#18181b" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{step === 'email' ? 'Send Code' : 'Verify & Enter'}</Text>
                <ArrowRight color="#18181b" size={18} style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>

          {step === 'otp' && (
            <TouchableOpacity onPress={() => setStep('email')} disabled={loading} style={styles.backButton}>
              <Text style={styles.backButtonText}>Change Email</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#09090b',
  },
  card: {
    backgroundColor: 'rgba(250, 250, 250, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(250, 250, 250, 0.05)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#fafafa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    color: '#fafafa',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#71717a',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 250, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(250, 250, 250, 0.1)',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fafafa',
    fontSize: 16,
    fontWeight: '500',
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fafafa',
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
