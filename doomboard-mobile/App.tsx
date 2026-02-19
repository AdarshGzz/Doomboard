import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useShareIntent } from 'expo-share-intent';
import { AppWindow, Rocket, AlertCircle, CheckCircle2, Link2, ExternalLink, XCircle } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { collectJob, type JobResponse } from './src/services/jobService';

export default function App() {
  const { hasShareIntent, shareIntent, resetShareIntent, error: shareError } = useShareIntent();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<JobResponse | null>(null);

  useEffect(() => {
    const link = shareIntent.webUrl || shareIntent.text;
    if (hasShareIntent && link) {
      handleProcessShare(link);
    }
  }, [hasShareIntent, shareIntent.text, shareIntent.webUrl]);

  const handleProcessShare = async (url: string) => {
    setIsProcessing(true);
    setResult(null);
    try {
      const resp = await collectJob(url);
      setResult(resp);
    } catch (err) {
      setResult({ success: false, error: 'System processing error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const openWebApp = () => {
    Linking.openURL('https://doomboard.vercel.app');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <AppWindow color="#fafafa" size={24} />
        </View>
        <View>
          <Text style={styles.title}>DOOMBOARD</Text>
          <Text style={styles.subtitle}>MOBILE COLLECTOR</Text>
        </View>
      </View>

      {/* Main Area */}
      <View style={styles.main}>
        {isProcessing ? (
          <View style={styles.statusCard}>
            <ActivityIndicator color="#fafafa" size="large" />
            <Text style={[styles.statusText, { marginTop: 20 }]}>TRACKING JOB LEAD...</Text>
          </View>
        ) : result ? (
          <View style={[styles.statusCard, result.success ? styles.successBorder : result.duplicate ? styles.warningBorder : styles.errorBorder]}>
            {result.success ? (
              <>
                <CheckCircle2 color="#22c55e" size={48} />
                <Text style={styles.statusTitle}>JOB SAVED</Text>
                <Text style={styles.statusDescription}>Link pushed to your dashboard. Background scraping started.</Text>
              </>
            ) : result.duplicate ? (
              <>
                <AlertCircle color="#eab308" size={48} />
                <Text style={styles.statusTitle}>DUPLICATE</Text>
                <Text style={styles.statusDescription}>This link is already in your board.</Text>
              </>
            ) : (
              <>
                <XCircle color="#ef4444" size={48} />
                <Text style={styles.statusTitle}>FAILED</Text>
                <Text style={styles.statusDescription}>{result.error || 'Could not save link.'}</Text>
              </>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setResult(null);
                resetShareIntent();
              }}
            >
              <Text style={styles.secondaryButtonText}>DONE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.idleContainer}>
            <View style={styles.placeholderIcon}>
              <Link2 color="#52525b" size={40} />
            </View>
            <Text style={styles.idleTitle}>Ready to Collect</Text>
            <Text style={styles.idleDescription}>
              Share a job link from your browser to Doomboard to track it instantly.
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={openWebApp}>
          <Text style={styles.primaryButtonText}>OPEN DASHBOARD</Text>
          <ExternalLink color="#18181b" size={16} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Reuse colors from web theme
const colors = {
  background: '#09090b',
  foreground: '#fafafa',
  zinc900: '#18181b',
  zinc800: '#27272a',
  zinc700: '#3f3f46',
  zinc500: '#71717a',
  primary: '#fafafa',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(250, 250, 250, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(250, 250, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.zinc500,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 2,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  idleContainer: {
    alignItems: 'center',
    gap: 16,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(250, 250, 250, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(250, 250, 250, 0.05)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  idleTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: 'bold',
  },
  idleDescription: {
    color: colors.zinc500,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(250, 250, 250, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(250, 250, 250, 0.05)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  statusTitle: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  statusDescription: {
    color: colors.zinc500,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  statusText: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  successBorder: { borderColor: 'rgba(34, 197, 94, 0.2)' },
  warningBorder: { borderColor: 'rgba(234, 179, 8, 0.2)' },
  errorBorder: { borderColor: 'rgba(239, 68, 68, 0.2)' },

  footer: {
    padding: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: colors.zinc900,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'rgba(250, 250, 250, 0.05)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(250, 250, 250, 0.1)',
  },
  secondaryButtonText: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
