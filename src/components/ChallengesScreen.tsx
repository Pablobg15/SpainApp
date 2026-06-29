import { StyleSheet, Text, View } from 'react-native';
import { challenges } from '../data/challenges';
import { provinces } from '../data/provinces';
import { appColors, appFonts } from '../theme';
import { ProvinceStatus } from './SpainProvinceMap';

type ChallengesScreenProps = {
  provinceStatuses: Record<string, ProvinceStatus>;
};

function isVisitedStatus(status?: ProvinceStatus) {
  return status === 'visited' || status === 'home';
}

function getProvinceName(provinceId: string) {
  return provinces.find((province) => province.id === provinceId)?.name ?? '';
}

export default function ChallengesScreen({
  provinceStatuses,
}: ChallengesScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.challengesList}>
        {challenges.map((challenge) => {
          const completedProvinces = challenge.provinceIds.filter(
            (provinceId) => isVisitedStatus(provinceStatuses[provinceId])
          ).length;

          const totalProvinces = challenge.provinceIds.length;

          const progress =
            totalProvinces > 0
              ? Math.round((completedProvinces / totalProvinces) * 100)
              : 0;

          const isCompleted = completedProvinces === totalProvinces;

          return (
            <View
              key={challenge.id}
              style={[
                styles.challengeCard,
                isCompleted && styles.challengeCardCompleted,
              ]}
            >
              <View style={styles.challengeTopRow}>
                <View style={styles.challengeTextBlock}>
                  <Text
                    style={[
                      styles.challengeTitle,
                      isCompleted && styles.challengeTitleCompleted,
                    ]}
                  >
                    {challenge.title}
                  </Text>

                  <Text style={styles.challengeDescription}>
                    {challenge.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.challengeStatusPill,
                    isCompleted && styles.challengeStatusPillCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.challengeStatusText,
                      isCompleted && styles.challengeStatusTextCompleted,
                    ]}
                  >
                    {isCompleted ? 'Completado' : `${progress}%`}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    isCompleted && styles.progressFillCompleted,
                    { width: `${progress}%` },
                  ]}
                />
              </View>

              <Text style={styles.challengeCounter}>
                {completedProvinces} de {totalProvinces} provincias
              </Text>

              <View style={styles.provinceChips}>
                {challenge.provinceIds.map((provinceId) => {
                  const isProvinceCompleted = isVisitedStatus(
                    provinceStatuses[provinceId]
                  );

                  return (
                    <View
                      key={provinceId}
                      style={[
                        styles.provinceChip,
                        isProvinceCompleted && styles.provinceChipCompleted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.provinceChipText,
                          isProvinceCompleted &&
                            styles.provinceChipTextCompleted,
                        ]}
                      >
                        {getProvinceName(provinceId)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}const styles = StyleSheet.create({
  screen: {
    backgroundColor: appColors.black,
    borderRadius: 28,
    gap: 20,
  },
  challengesList: {
    gap: 14,
  },
  challengeCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    padding: 17,
    borderWidth: 1,
    borderColor: appColors.border,
    gap: 14,
  },
  challengeCardCompleted: {
    backgroundColor: appColors.surface,
    borderColor: appColors.visited,
  },
  challengeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  challengeTextBlock: {
    flex: 1,
  },
  challengeTitle: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
    fontFamily: appFonts.main,
  },
  challengeTitleCompleted: {
    color: appColors.text,
  },
  challengeDescription: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: appFonts.main,
  },
  challengeStatusPill: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  challengeStatusPillCompleted: {
    backgroundColor: appColors.text,
    borderColor: appColors.text,
  },
  challengeStatusText: {
    color: appColors.text,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  challengeStatusTextCompleted: {
    color: appColors.black,
  },
  progressBar: {
    height: 10,
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: appColors.text,
    borderRadius: 100,
  },
  progressFillCompleted: {
    backgroundColor: appColors.visited,
  },
  challengeCounter: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  provinceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  provinceChip: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  provinceChipCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: appColors.visited,
  },
  provinceChipText: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  provinceChipTextCompleted: {
    color: appColors.visited,
  },
});