import { StyleSheet, Text, View } from 'react-native';
import { appColors, appFonts } from '../theme';

type AppHeaderProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export default function AppHeader({
  title,
  subtitle,
  eyebrow = 'Spain Travel Map',
}: AppHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>S</Text>
        </View>

        <View style={styles.brandTextBlock}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.appName}>España</Text>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    gap: 22,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: appColors.black,
    fontSize: 22,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  brandTextBlock: {
    gap: 2,
  },
  eyebrow: {
    color: appColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontFamily: appFonts.main,
  },
  appName: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    color: appColors.text,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  subtitle: {
    color: appColors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    fontFamily: appFonts.main,
  },
});