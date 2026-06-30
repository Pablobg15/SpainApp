import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import AuthScreen from '../components/AuthScreen';
import ChallengesScreen from '../components/ChallengesScreen';
import ProvincesScreen from '../components/ProvincesScreen';
import SpainProvinceMap, {
  ProvinceStatus,
} from '../components/SpainProvinceMap';
import TripsScreen, { type Trip } from '../components/TripsScreen';
import { challenges } from '../data/challenges';
import { provinces as allProvinces } from '../data/provinces';
import { deleteAccount } from '../lib/account';
import { fetchProfileName } from '../lib/profiles';
import {
  fetchProvinceStatuses,
  removeProvinceStatus,
  upsertProvinceStatus,
} from '../lib/provinceStatuses';
import { supabase } from '../lib/supabase';
import {
  isSupabaseTripImageUrl,
  uploadTripImage,
} from '../lib/tripImages';
import {
  createTrip,
  deleteTripFromSupabase,
  fetchTrips,
  updateTripInSupabase,
} from '../lib/trips';
import { appColors, appFonts } from '../theme';

type ActiveTab = 'map' | 'provinces' | 'trips' | 'challenges' | 'profile';

function fromIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(isoDate: string) {
  if (!isoDate) {
    return '';
  }

  const date = fromIsoDate(isoDate);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function getProvinceName(provinceId: string) {
  return (
    allProvinces.find((province) => province.id === provinceId)?.name ?? ''
  );
}

export default function HomeScreen() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profileName, setProfileName] = useState('');

  const [provinceStatuses, setProvinceStatuses] = useState<
    Record<string, ProvinceStatus>
  >({});

  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedProfileTrip, setSelectedProfileTrip] = useState<Trip | null>(
    null
  );

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);
      setIsAuthenticated(Boolean(data.session));
      setIsAuthLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsAuthenticated(Boolean(currentSession));
      setIsAuthLoading(false);

      if (!currentSession) {
        setProvinceStatuses({});
        setTrips([]);
        setSelectedProfileTrip(null);
        setProfileName('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      if (!session?.user.id) {
        return;
      }

      try {
        const [savedStatuses, savedTrips, savedProfileName] =
          await Promise.all([
            fetchProvinceStatuses(session.user.id),
            fetchTrips(session.user.id),
            fetchProfileName(session.user.id),
          ]);

        if (isMounted) {
          setProvinceStatuses(savedStatuses);
          setTrips(savedTrips);
          setProfileName(
            savedProfileName ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'Usuario'
          );
        }
      } catch (error) {
        console.log('Error loading user data:', error);

        if (isMounted) {
          setProfileName(
            session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'Usuario'
          );
        }
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [session?.user.id]);

  async function setProvinceStatus(id: string, status: ProvinceStatus) {
    setSelectedProvince(id);

    setProvinceStatuses((currentStatuses) => ({
      ...currentStatuses,
      [id]: status,
    }));

    if (!session?.user.id) {
      return;
    }

    try {
      await upsertProvinceStatus(session.user.id, id, status);
    } catch (error) {
      console.log('Error saving province status:', error);
    }
  }

  async function clearProvinceStatus(id: string) {
    setProvinceStatuses((currentStatuses) => {
      const updatedStatuses = { ...currentStatuses };
      delete updatedStatuses[id];
      return updatedStatuses;
    });

    if (!session?.user.id) {
      return;
    }

    try {
      await removeProvinceStatus(session.user.id, id);
    } catch (error) {
      console.log('Error removing province status:', error);
    }
  }

  async function markTripProvinceAsVisited(provinceId: string) {
    if (provinceStatuses[provinceId] === 'home') {
      return;
    }

    setProvinceStatuses((currentStatuses) => ({
      ...currentStatuses,
      [provinceId]: 'visited',
    }));

    if (!session?.user.id) {
      return;
    }

    try {
      await upsertProvinceStatus(session.user.id, provinceId, 'visited');
    } catch (error) {
      console.log('Error saving trip province status:', error);
    }
  }

  async function getSavedTripImageUri(imageUri?: string) {
  if (!imageUri || !session?.user.id) {
    return imageUri;
  }

  if (isSupabaseTripImageUrl(imageUri)) {
    return imageUri;
  }

  return uploadTripImage(session.user.id, imageUri);
}

  async function addTrip(trip: Trip) {
  if (!session?.user.id) {
    setTrips((currentTrips) => [trip, ...currentTrips]);
    return;
  }

  try {
    const savedImageUri = await getSavedTripImageUri(trip.imageUri);

    const tripToSave: Trip = {
      ...trip,
      imageUri: savedImageUri,
    };

    const savedTrip = await createTrip(session.user.id, tripToSave);

    setTrips((currentTrips) => [savedTrip, ...currentTrips]);
  } catch (error) {
    console.log('Error creating trip:', error);
  }
}
  async function updateTrip(updatedTrip: Trip) {
  setTrips((currentTrips) =>
    currentTrips.map((trip) =>
      trip.id === updatedTrip.id ? updatedTrip : trip
    )
  );

  setSelectedProfileTrip((currentTrip) =>
    currentTrip?.id === updatedTrip.id ? updatedTrip : currentTrip
  );

  if (!session?.user.id) {
    return;
  }

  try {
    const savedImageUri = await getSavedTripImageUri(updatedTrip.imageUri);

    const tripToSave: Trip = {
      ...updatedTrip,
      imageUri: savedImageUri,
    };

    const savedTrip = await updateTripInSupabase(
      session.user.id,
      tripToSave
    );

    setTrips((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === savedTrip.id ? savedTrip : trip
      )
    );

    setSelectedProfileTrip((currentTrip) =>
      currentTrip?.id === savedTrip.id ? savedTrip : currentTrip
    );
  } catch (error) {
    console.log('Error updating trip:', error);
  }
}

  async function deleteTrip(tripId: string) {
    const tripToDelete = trips.find((trip) => trip.id === tripId);

    setTrips((currentTrips) =>
      currentTrips.filter((trip) => trip.id !== tripId)
    );

    setSelectedProfileTrip((currentTrip) =>
      currentTrip?.id === tripId ? null : currentTrip
    );

    if (!session?.user.id) {
      return;
    }

    try {
      await deleteTripFromSupabase(session.user.id, tripId);
    } catch (error) {
      console.log('Error deleting trip:', error);

      if (tripToDelete) {
        setTrips((currentTrips) => [tripToDelete, ...currentTrips]);
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setSession(null);
    setIsAuthenticated(false);
    setProfileName('');
    setProvinceStatuses({});
    setTrips([]);
    setActiveTab('map');
    setSelectedProvince(null);
    setSelectedProfileTrip(null);
  }  async function confirmDeleteAccount() {
    try {
      await deleteAccount();

      await supabase.auth.signOut();

      setSession(null);
      setIsAuthenticated(false);
      setProfileName('');
      setProvinceStatuses({});
      setTrips([]);
      setActiveTab('map');
      setSelectedProvince(null);
      setSelectedProfileTrip(null);
    } catch (error) {
      console.log('Error deleting account:', error);

      Alert.alert(
        'No se pudo eliminar la cuenta',
        'Inténtalo de nuevo en unos segundos.'
      );
    }
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción borrará tu usuario, tus provincias, tus viajes y tus imágenes. No se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  }

  const visitedIds = Object.entries(provinceStatuses)
    .filter(([, status]) => status === 'visited' || status === 'home')
    .map(([id]) => id);

  const visitedCount = visitedIds.length;

  const wishlistCount = Object.values(provinceStatuses).filter(
    (status) => status === 'wishlist'
  ).length;

  const totalCount = allProvinces.length;

  const progress =
    totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const completedChallengesCount = challenges.filter((challenge) =>
    challenge.provinceIds.every((provinceId) => {
      const status = provinceStatuses[provinceId];
      return status === 'visited' || status === 'home';
    })
  ).length;

  const totalChallengesCount = challenges.length;

  const headerContent =
    activeTab === 'map'
      ? {
          title: 'Mapa',
          subtitle: `Has visitado ${visitedCount} de ${totalCount} provincias.`,
        }
      : activeTab === 'provinces'
        ? {
            title: 'Provincias',
            subtitle: 'Explora todas las provincias de España.',
          }
        : activeTab === 'trips'
          ? {
              title: 'Viajes',
              subtitle: 'Guarda tus escapadas y recuerdos por España.',
            }
          : activeTab === 'challenges'
            ? {
                title: 'Retos',
                subtitle: 'Completa rutas, comunidades y objetivos viajeros.',
              }
            : {
                title: 'Perfil',
                subtitle: 'Tu resumen personal de viajes por España.',
              };

  if (isAuthLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={appColors.white} />
        <Text style={styles.loadingText}>Cargando sesión...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <View style={styles.appBackground}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.phoneFrame}>
          <AppHeader
            title={headerContent.title}
            subtitle={headerContent.subtitle}
          />

          {activeTab === 'map' ? (
            <SpainProvinceMap
              provinceStatuses={provinceStatuses}
              onSelectProvince={setSelectedProvince}
              onSetProvinceStatus={setProvinceStatus}
              onClearProvinceStatus={clearProvinceStatus}
              selectedProvince={selectedProvince}
            />
          ) : activeTab === 'provinces' ? (
            <ProvincesScreen provinceStatuses={provinceStatuses} />
          ) : activeTab === 'trips' ? (
            <TripsScreen
              trips={trips}
              onAddTrip={addTrip}
              onUpdateTrip={updateTrip}
              onDeleteTrip={deleteTrip}
              onTripProvinceSaved={markTripProvinceAsVisited}
            />
          ) : activeTab === 'challenges' ? (
            <ChallengesScreen provinceStatuses={provinceStatuses} />
          ) : (
            <>
              <View style={styles.profileCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(profileName || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.profileInfoBlock}>
                  <Text style={styles.profileName}>
                    {profileName || 'Usuario'}
                  </Text>
                  <Text style={styles.profileSubtitle}>Viajero por España</Text>
                </View>

                <Pressable
                  style={styles.profileLogoutButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.profileLogoutButtonText}>Cerrar Sesión</Text>
                </Pressable>
              </View>

              <View style={styles.completionCard}>
                <View style={styles.completionHeader}>
                  <View>
                    <Text style={styles.completionNumber}>{progress}%</Text>
                    <Text style={styles.completionLabel}>Completado</Text>
                  </View>

                  <Text style={styles.completionCounter}>
                    {visitedCount} / {totalCount}
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{visitedCount}</Text>
                  <Text style={styles.summaryLabel}>Visitadas</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{wishlistCount}</Text>
                  <Text style={styles.summaryLabel}>Quiero ir</Text>
                </View>
              </View>

              <View style={styles.profileChallengesCard}>
                <View style={styles.profileChallengesTextBlock}>
                  <Text style={styles.profileChallengesTitle}>
                    Retos completados
                  </Text>

                  <Text style={styles.profileChallengesSubtitle}>
                    Has completado {completedChallengesCount} de{' '}
                    {totalChallengesCount} retos.
                  </Text>
                </View>

                <Text style={styles.profileChallengesNumber}>
                  {completedChallengesCount}/{totalChallengesCount}
                </Text>
              </View>

              <View style={styles.profileTripsCard}>
                <View style={styles.profileTripsHeader}>
                  <View style={styles.profileTripsTitleBlock}>
                    <Text style={styles.profileTripsTitle}>Mis viajes</Text>

                    <Text style={styles.profileTripsSubtitle}>
                      Resumen de tus escapadas guardadas
                    </Text>
                  </View>

                  <View style={styles.profileTripsCountPill}>
                    <Text style={styles.profileTripsCountText}>
                      {trips.length}
                    </Text>
                  </View>
                </View>

                {trips.length === 0 ? (
                  <View style={styles.profileTripsEmptyCard}>
                    <Text style={styles.profileTripsEmptyTitle}>
                      Aún no tienes viajes
                    </Text>

                    <Text style={styles.profileTripsEmptyText}>
                      Cuando añadas un viaje, aparecerá aquí con sus fechas e
                      información.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.profileTripsList}>
                    {trips.slice(0, 3).map((trip) => (
                      <Pressable
                        key={trip.id}
                        style={styles.profileTripRow}
                        onPress={() => setSelectedProfileTrip(trip)}
                      >
                        {trip.imageUri ? (
                          <Image
                            source={{ uri: trip.imageUri }}
                            style={styles.profileTripThumb}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.profileTripThumbPlaceholder}>
                            <Text style={styles.profileTripThumbIcon}>✈️</Text>
                          </View>
                        )}

                        <View style={styles.profileTripInfo}>
                          <Text style={styles.profileTripName}>
                            {trip.name}
                          </Text>

                          <Text style={styles.profileTripDates}>
                            {formatDate(trip.startDate)} -{' '}
                            {formatDate(trip.endDate)}
                          </Text>

                          <Text style={styles.profileTripProvince}>
                            {getProvinceName(trip.provinceId)}
                          </Text>
                        </View>

                        <Text style={styles.profileTripArrow}>›</Text>
                      </Pressable>
                    ))}

                    {trips.length > 3 ? (
                      <Text style={styles.profileTripsMore}>
                        Y {trips.length - 3} viaje
                        {trips.length - 3 === 1 ? '' : 's'} más
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>

              <Pressable
                style={styles.deleteAccountButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteAccountButtonText}>
                  Eliminar cuenta
                </Text>
              </Pressable>
            </>
          )}
        </View>
           </ScrollView>

      <View style={styles.bottomBarWrapper}>
        <View style={styles.tabBar}>
          <Pressable
            style={styles.tabButton}
            onPress={() => setActiveTab('map')}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'map' && styles.tabIconActive,
              ]}
            >
              🗺️
            </Text>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'map' && styles.tabButtonTextActive,
              ]}
            >
              Mapa
            </Text>
          </Pressable>

          <Pressable
            style={styles.tabButton}
            onPress={() => setActiveTab('provinces')}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'provinces' && styles.tabIconActive,
              ]}
            >
              ☰
            </Text>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'provinces' && styles.tabButtonTextActive,
              ]}
            >
              Provincias
            </Text>
          </Pressable>

          <Pressable
            style={styles.tabButton}
            onPress={() => setActiveTab('trips')}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'trips' && styles.tabIconActive,
              ]}
            >
              ✈️
            </Text>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'trips' && styles.tabButtonTextActive,
              ]}
            >
              Viajes
            </Text>
          </Pressable>

          <Pressable
            style={styles.tabButton}
            onPress={() => setActiveTab('challenges')}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'challenges' && styles.tabIconActive,
              ]}
            >
              🏆
            </Text>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'challenges' && styles.tabButtonTextActive,
              ]}
            >
              Retos
            </Text>
          </Pressable>

          <Pressable
            style={styles.tabButton}
            onPress={() => setActiveTab('profile')}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'profile' && styles.tabIconActive,
              ]}
            >
              👤
            </Text>
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'profile' && styles.tabButtonTextActive,
              ]}
            >
              Perfil
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={!!selectedProfileTrip}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedProfileTrip(null)}
      >
        <View style={styles.tripDetailOverlay}>
          <View style={styles.tripDetailCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.tripDetailHeader}>
                <View style={styles.tripDetailTitleBlock}>
                  <Text style={styles.tripDetailEyebrow}>
                    Detalle del viaje
                  </Text>

                  <Text style={styles.tripDetailTitle}>
                    {selectedProfileTrip?.name ?? ''}
                  </Text>
                </View>

                <Pressable
                  style={styles.tripDetailCloseIcon}
                  onPress={() => setSelectedProfileTrip(null)}
                >
                  <Text style={styles.tripDetailCloseIconText}>×</Text>
                </Pressable>
              </View>

              {selectedProfileTrip?.imageUri ? (
                <Image
                  source={{ uri: selectedProfileTrip.imageUri }}
                  style={styles.tripDetailImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.tripDetailImagePlaceholder}>
                  <Text style={styles.tripDetailImagePlaceholderIcon}>✈️</Text>
                </View>
              )}

              <View style={styles.tripDetailInfoGrid}>
                <View style={styles.tripDetailInfoCard}>
                  <Text style={styles.tripDetailInfoLabel}>Provincia</Text>

                  <Text style={styles.tripDetailInfoValue}>
                    {selectedProfileTrip
                      ? getProvinceName(selectedProfileTrip.provinceId)
                      : ''}
                  </Text>
                </View>

                <View style={styles.tripDetailInfoCard}>
                  <Text style={styles.tripDetailInfoLabel}>Fechas</Text>

                  <Text style={styles.tripDetailInfoValue}>
                    {selectedProfileTrip
                      ? `${formatDate(
                          selectedProfileTrip.startDate
                        )} - ${formatDate(selectedProfileTrip.endDate)}`
                      : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.tripDetailNotesCard}>
                <Text style={styles.tripDetailNotesTitle}>Descripción</Text>

                <Text style={styles.tripDetailNotesText}>
                  {selectedProfileTrip?.notes
                    ? selectedProfileTrip.notes
                    : 'Este viaje no tiene descripción añadida.'}
                </Text>
              </View>

              <Pressable
                style={styles.tripDetailCloseButton}
                onPress={() => setSelectedProfileTrip(null)}
              >
                <Text style={styles.tripDetailCloseButtonText}>Cerrar</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: appColors.black,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: appColors.textSecondary,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  appBackground: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  container: {
    minHeight: '100%',
    alignItems: 'center',
    padding: 20,
    paddingTop: 34,
    paddingBottom: 120,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 430,
  },
  profileCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: appColors.black,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  profileInfoBlock: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: appColors.text,
    fontFamily: appFonts.main,
  },
  profileSubtitle: {
    fontSize: 15,
    color: appColors.textMuted,
    marginTop: 2,
    fontFamily: appFonts.main,
  },
  profileLogoutButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  profileLogoutButtonText: {
    color: appColors.text,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },  completionCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    marginBottom: 14,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  completionNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: appColors.text,
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  completionLabel: {
    fontSize: 15,
    color: appColors.textSecondary,
    fontFamily: appFonts.main,
  },
  completionCounter: {
    fontSize: 16,
    fontWeight: '900',
    color: appColors.text,
    marginTop: 6,
    fontFamily: appFonts.main,
  },
  progressBar: {
    height: 12,
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: appColors.white,
    borderRadius: 100,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: appColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  summaryNumber: {
    fontSize: 30,
    fontWeight: '900',
    color: appColors.text,
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  summaryLabel: {
    fontSize: 14,
    color: appColors.textMuted,
    fontFamily: appFonts.main,
  },
  profileChallengesCard: {
    backgroundColor: appColors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileChallengesTextBlock: {
    flex: 1,
  },
  profileChallengesTitle: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 5,
    fontFamily: appFonts.main,
  },
  profileChallengesSubtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  profileChallengesNumber: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  profileTripsCard: {
    backgroundColor: appColors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    marginBottom: 14,
    gap: 14,
  },
  profileTripsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileTripsTitleBlock: {
    flex: 1,
  },
  profileTripsTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: appColors.text,
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  profileTripsSubtitle: {
    fontSize: 14,
    color: appColors.textMuted,
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  profileTripsCountPill: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  profileTripsCountText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  profileTripsEmptyCard: {
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  profileTripsEmptyTitle: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
    fontFamily: appFonts.main,
  },
  profileTripsEmptyText: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  profileTripsList: {
    gap: 10,
  },
  profileTripRow: {
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileTripThumb: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: appColors.surface,
  },
  profileTripThumbPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: appColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTripThumbIcon: {
    fontSize: 24,
  },
  profileTripInfo: {
    flex: 1,
  },
  profileTripName: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 3,
    fontFamily: appFonts.main,
  },
  profileTripDates: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
    fontFamily: appFonts.main,
  },
  profileTripProvince: {
    color: appColors.text,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  profileTripArrow: {
    color: appColors.textMuted,
    fontSize: 26,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  profileTripsMore: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: appFonts.main,
  },
  deleteAccountButton: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteAccountButtonText: {
    color: appColors.home,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  bottomBarWrapper: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: appColors.border,
  },
  tabBar: {
    width: '100%',
    maxWidth: 430,
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabIcon: {
    fontSize: 21,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: appColors.textMuted,
    fontFamily: appFonts.main,
  },
  tabButtonTextActive: {
    color: appColors.white,
  },
  tripDetailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tripDetailCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '88%',
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
  },
  tripDetailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  tripDetailTitleBlock: {
    flex: 1,
  },
  tripDetailEyebrow: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
    fontFamily: appFonts.main,
  },
  tripDetailTitle: {
    color: appColors.text,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 31,
    fontFamily: appFonts.main,
  },
  tripDetailCloseIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripDetailCloseIconText: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 25,
    fontFamily: appFonts.main,
  },
  tripDetailImage: {
    width: '100%',
    height: 210,
    borderRadius: 20,
    backgroundColor: appColors.surfaceSoft,
    marginBottom: 14,
  },
  tripDetailImagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 20,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  tripDetailImagePlaceholderIcon: {
    fontSize: 42,
  },
  tripDetailInfoGrid: {
    gap: 10,
    marginBottom: 14,
  },
  tripDetailInfoCard: {
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  tripDetailInfoLabel: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 5,
    fontFamily: appFonts.main,
  },
  tripDetailInfoValue: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripDetailNotesCard: {
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: appColors.border,
    marginBottom: 14,
  },
  tripDetailNotesTitle: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: appFonts.main,
  },
  tripDetailNotesText: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: appFonts.main,
  },
  tripDetailCloseButton: {
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tripDetailCloseButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});