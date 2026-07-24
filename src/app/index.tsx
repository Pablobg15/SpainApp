import type { Session } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

import AuthScreen from '../components/AuthScreen';
import ChallengesScreen from '../components/ChallengesScreen';
import ErrorState from '../components/ErrorState';
import FriendsScreen from '../components/FriendsScreen';
import LegalFooter from '../components/LegalFooter';
import ProvincesScreen from '../components/ProvincesScreen';
import SettingsModal from '../components/SettingsModal';
import SpainProvinceMap, {
  ProvinceStatus,
} from '../components/SpainProvinceMap';
import TripsScreen, { Trip } from '../components/TripsScreen';

import { challenges } from '../data/challenges';
import { provinces } from '../data/provinces';
import { deleteAccount } from '../lib/account';
import {
  isSupabaseProfileImageUrl,
  uploadProfileImage,
} from '../lib/profileImages';
import {
  fetchProfile,
  updateProfileAvatar,
  updateProfileName,
} from '../lib/profiles';
import {
  fetchProvinceStatuses,
  removeProvinceStatus,
  upsertProvinceStatus,
} from '../lib/provinceStatuses';
import { supabase } from '../lib/supabase';
import { isSupabaseTripImageUrl, uploadTripImage } from '../lib/tripImages';
import {
  createTrip,
  deleteTripFromSupabase,
  fetchTrips,
  updateTripInSupabase,
} from '../lib/trips';
import { appColors, appFonts } from '../theme';

type TabId = 'map' | 'provinces' | 'trips' | 'challenges' | 'friends' | 'profile';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'map', label: 'Mapa', icon: '🗺️' },
  { id: 'provinces', label: 'Provincias', icon: '📍' },
  { id: 'trips', label: 'Viajes', icon: '✈️' },
  { id: 'challenges', label: 'Retos', icon: '🏆' },
  { id: 'friends', label: 'Amigos', icon: '👥' },
  { id: 'profile', label: 'Perfil', icon: '👤' },
];

const ProvincesScreenView = ProvincesScreen as any;
const TripsScreenView = TripsScreen as any;
const ChallengesScreenView = ChallengesScreen as any;
const FriendsScreenView = FriendsScreen as any;

function getProvinceName(provinceId?: string) {
  if (!provinceId) {
    return 'Sin provincia';
  }

  return (
    provinces.find((province) => province.id === provinceId)?.name ??
    provinceId
  );
}

function formatDate(date: string) {
  if (!date) {
    return '';
  }

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function getTripDateText(trip: Trip) {
  if (trip.startDate === trip.endDate) {
    return formatDate(trip.startDate);
  }

  return `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`;
}

function getChallengeProvinceIds(challenge: any) {
  return (
    challenge.provinceIds ??
    challenge.provinces ??
    challenge.requiredProvinceIds ??
    []
  );
}

function getChallengeTitle(challenge: any) {
  return challenge.title ?? challenge.name ?? 'Reto completado';
}

export default function HomeScreen() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const [profileName, setProfileName] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | undefined>();
  const [isProfileImageLoading, setIsProfileImageLoading] = useState(false);

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isProfileNameSaving, setIsProfileNameSaving] = useState(false);

  const [isUserDataLoading, setIsUserDataLoading] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

  const [provinceStatuses, setProvinceStatuses] = useState<
    Record<string, ProvinceStatus>
  >({});
  const [trips, setTrips] = useState<Trip[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedProfileTrip, setSelectedProfileTrip] = useState<Trip | null>(
    null
  );

  const [activeTab, setActiveTab] = useState<TabId>('map');

  const userId = session?.user.id;

  const visitedCount = useMemo(
    () =>
      Object.values(provinceStatuses).filter(
        (status) => status === 'visited' || status === 'home'
      ).length,
    [provinceStatuses]
  );

  const wishlistCount = useMemo(
    () =>
      Object.values(provinceStatuses).filter((status) => status === 'wishlist')
        .length,
    [provinceStatuses]
  );

  const homeProvince = useMemo(() => {
    const homeProvinceId = Object.entries(provinceStatuses).find(
      ([, status]) => status === 'home'
    )?.[0];

    return getProvinceName(homeProvinceId);
  }, [provinceStatuses]);

  const progress = Math.round((visitedCount / provinces.length) * 100);

  const latestTrips = trips.slice(0, 3);

  const completedChallenges = useMemo(() => {
    return (challenges as any[]).filter((challenge) => {
      const provinceIds = getChallengeProvinceIds(challenge);

      if (!Array.isArray(provinceIds) || provinceIds.length === 0) {
        return false;
      }

      return provinceIds.every((provinceId: string) => {
        const status = provinceStatuses[provinceId];

        return status === 'visited' || status === 'home';
      });
    });
  }, [provinceStatuses]);

  const latestMedals = completedChallenges.slice(0, 6);

  const resetUserData = useCallback(() => {
    setProfileName('');
    setProfileAvatarUrl(undefined);
    setProvinceStatuses({});
    setTrips([]);
    setSelectedProvince(null);
    setSelectedProfileTrip(null);
    setLoadErrorMessage('');
    setIsSettingsVisible(false);
    setActiveTab('map');
  }, []);

  const loadUserData = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setIsUserDataLoading(true);
      setLoadErrorMessage('');

      const [statusesResult, tripsResult, profileResult] = await Promise.all([
        fetchProvinceStatuses(userId),
        fetchTrips(userId),
        fetchProfile(userId),
      ]);

      setProvinceStatuses(statusesResult);
      setTrips(tripsResult);
      setProfileName(profileResult.name || 'Usuario');
      setProfileAvatarUrl(profileResult.avatarUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la información.';

      setLoadErrorMessage(message);
    } finally {
      setIsUserDataLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const { data } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        setSession(data.session);
        setIsAuthenticated(Boolean(data.session));
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthenticated(Boolean(nextSession));

      if (!nextSession) {
        resetUserData();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [resetUserData]);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId, loadUserData]);

  async function handleSetProvinceStatus(
    provinceId: string,
    status: ProvinceStatus
  ) {
    if (!userId) {
      return;
    }

    const previousStatuses = provinceStatuses;

    try {
      setProvinceStatuses((currentStatuses) => ({
        ...currentStatuses,
        [provinceId]: status,
      }));

      await upsertProvinceStatus(userId, provinceId, status);
      setLoadErrorMessage('');
    } catch (error) {
      setProvinceStatuses(previousStatuses);

      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la provincia.';

      setLoadErrorMessage(message);
    }
  }

  async function handleClearProvinceStatus(provinceId: string) {
    if (!userId) {
      return;
    }

    const previousStatuses = provinceStatuses;

    try {
      setProvinceStatuses((currentStatuses) => {
        const updatedStatuses = { ...currentStatuses };
        delete updatedStatuses[provinceId];

        return updatedStatuses;
      });

      await removeProvinceStatus(userId, provinceId);
      setLoadErrorMessage('');
    } catch (error) {
      setProvinceStatuses(previousStatuses);

      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo quitar el estado de la provincia.';

      setLoadErrorMessage(message);
    }
  }

  async function saveTripImageIfNeeded(imageUri?: string) {
    if (!userId || !imageUri) {
      return imageUri;
    }

    if (isSupabaseTripImageUrl(imageUri)) {
      return imageUri;
    }

    return uploadTripImage(userId, imageUri);
  }

  async function handleAddTrip(trip: Trip) {
    if (!userId) {
      return;
    }

    try {
      const savedImageUri = await saveTripImageIfNeeded(trip.imageUri);

      const savedTrip = await createTrip(userId, {
        ...trip,
        imageUri: savedImageUri,
      });

      setTrips((currentTrips) => [savedTrip, ...currentTrips]);

      if (provinceStatuses[savedTrip.provinceId] !== 'home') {
        setProvinceStatuses((currentStatuses) => ({
          ...currentStatuses,
          [savedTrip.provinceId]: 'visited',
        }));

        await upsertProvinceStatus(userId, savedTrip.provinceId, 'visited');
      }

      setLoadErrorMessage('');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo crear el viaje.';

      setLoadErrorMessage(message);
    }
  }

  async function handleUpdateTrip(trip: Trip) {
    if (!userId) {
      return;
    }

    try {
      const savedImageUri = await saveTripImageIfNeeded(trip.imageUri);

      const updatedTrip = await updateTripInSupabase(userId, {
        ...trip,
        imageUri: savedImageUri,
      });

      setTrips((currentTrips) =>
        currentTrips.map((currentTrip) =>
          currentTrip.id === updatedTrip.id ? updatedTrip : currentTrip
        )
      );

      if (provinceStatuses[updatedTrip.provinceId] !== 'home') {
        setProvinceStatuses((currentStatuses) => ({
          ...currentStatuses,
          [updatedTrip.provinceId]: 'visited',
        }));

        await upsertProvinceStatus(userId, updatedTrip.provinceId, 'visited');
      }

      setLoadErrorMessage('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el viaje.';

      setLoadErrorMessage(message);
    }
  }  async function handleDeleteTrip(tripId: string) {
    if (!userId) {
      return;
    }

    try {
      await deleteTripFromSupabase(userId, tripId);

      setTrips((currentTrips) =>
        currentTrips.filter((trip) => trip.id !== tripId)
      );

      setLoadErrorMessage('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el viaje.';

      setLoadErrorMessage(message);
    }
  }

  async function handleChangeProfileImage() {
    if (!userId || isProfileImageLoading) {
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos permiso para acceder a tus fotos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      setIsProfileImageLoading(true);

      const selectedImageUri = result.assets[0].uri;

      setProfileAvatarUrl(selectedImageUri);

      const savedAvatarUrl = isSupabaseProfileImageUrl(selectedImageUri)
        ? selectedImageUri
        : await uploadProfileImage(userId, selectedImageUri);

      await updateProfileAvatar(userId, savedAvatarUrl);

      setProfileAvatarUrl(`${savedAvatarUrl}?t=${Date.now()}`);
      setLoadErrorMessage('');

      Alert.alert('Foto actualizada', 'Tu foto de perfil se ha cambiado.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo cambiar la foto de perfil.';

      Alert.alert('Error', message);
    } finally {
      setIsProfileImageLoading(false);
    }
  }

  async function handleSaveProfileName(newName: string) {
    if (!userId) {
      throw new Error('No hay sesión activa.');
    }

    try {
      setIsProfileNameSaving(true);

      await updateProfileName(userId, newName);

      setProfileName(newName);
      setLoadErrorMessage('');
    } finally {
      setIsProfileNameSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setIsAuthenticated(false);
      resetUserData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo cerrar sesión.';

      Alert.alert('Error', message);
    }
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción eliminará tu cuenta y los datos asociados. No se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              await supabase.auth.signOut();

              setSession(null);
              setIsAuthenticated(false);
              resetUserData();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'No se pudo eliminar la cuenta.';

              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  }

  function renderAvatar(size: number) {
    if (profileAvatarUrl) {
      return (
        <Image
          source={{ uri: profileAvatarUrl }}
          style={[
            styles.avatarImage,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      );
    }

    return (
      <View
        style={[
          styles.avatarPlaceholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text style={styles.avatarPlaceholderText}>
          {(profileName || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  function renderLoadingCard() {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator color={appColors.white} size="large" />

        <Text style={styles.loadingTitle}>Cargando SpainApp</Text>

        <Text style={styles.loadingText}>
          Estamos preparando tu mapa, viajes y perfil.
        </Text>
      </View>
    );
  }

  function renderProfileScreen() {
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileHeroCard}>
          <Pressable
            style={styles.avatarButton}
            onPress={handleChangeProfileImage}
            disabled={isProfileImageLoading}
          >
            {renderAvatar(96)}

            <View style={styles.avatarEditBadge}>
              {isProfileImageLoading ? (
                <ActivityIndicator color={appColors.black} size="small" />
              ) : (
                <Text style={styles.avatarEditBadgeText}>📷</Text>
              )}
            </View>
          </Pressable>

          <Text style={styles.profileName}>{profileName || 'Usuario'}</Text>

          <Text style={styles.profileSubtitle}>
            {visitedCount} provincias visitadas de {provinces.length}
          </Text>

          <View style={styles.profileProgressBar}>
            <View
              style={[
                styles.profileProgressFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.profileProgressText}>{progress}% completado</Text>

          <Pressable
            style={styles.profileSettingsButton}
            onPress={() => setIsSettingsVisible(true)}
          >
            <Text style={styles.profileSettingsButtonText}>
              Editar perfil y ajustes
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{visitedCount}</Text>
            <Text style={styles.statLabel}>Visitadas</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{wishlistCount}</Text>
            <Text style={styles.statLabel}>Quiero ir</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Viajes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{homeProvince}</Text>
            <Text style={styles.statLabel}>Vivo aquí</Text>
          </View>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Medallas conseguidas</Text>
              <Text style={styles.sectionSubtitle}>
                {completedChallenges.length} retos completados
              </Text>
            </View>

            <Pressable onPress={() => setActiveTab('challenges')}>
              <Text style={styles.sectionAction}>Ver retos</Text>
            </Pressable>
          </View>

          {latestMedals.length > 0 ? (
            <View style={styles.medalsGrid}>
              {latestMedals.map((challenge: any) => (
                <View
                  key={challenge.id ?? getChallengeTitle(challenge)}
                  style={styles.medalCard}
                >
                  <View style={styles.medalIcon}>
                    <Text style={styles.medalIconText}>🏅</Text>
                  </View>

                  <Text style={styles.medalTitle} numberOfLines={2}>
                    {getChallengeTitle(challenge)}
                  </Text>

                  <Text style={styles.medalSubtitle}>Completado</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Todavía no tienes medallas</Text>

              <Text style={styles.emptyText}>
                Completa retos visitando provincias para desbloquear tus
                primeras medallas.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={() => setActiveTab('challenges')}
              >
                <Text style={styles.emptyButtonText}>Ver retos</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Mis últimos viajes</Text>
              <Text style={styles.sectionSubtitle}>
                Tus viajes más recientes
              </Text>
            </View>

            <Pressable onPress={() => setActiveTab('trips')}>
              <Text style={styles.sectionAction}>Ver todos</Text>
            </Pressable>
          </View>

          {latestTrips.length > 0 ? (
            <View style={styles.tripPreviewList}>
              {latestTrips.map((trip) => (
                <Pressable
                  key={trip.id}
                  style={styles.tripPreviewCard}
                  onPress={() => setSelectedProfileTrip(trip)}
                >
                  {trip.imageUri ? (
                    <Image
                      source={{ uri: trip.imageUri }}
                      style={styles.tripPreviewImage}
                    />
                  ) : (
                    <View style={styles.tripPreviewImagePlaceholder}>
                      <Text style={styles.tripPreviewImagePlaceholderText}>
                        ✈️
                      </Text>
                    </View>
                  )}

                  <View style={styles.tripPreviewInfo}>
                    <Text style={styles.tripPreviewName}>{trip.name}</Text>

                    <Text style={styles.tripPreviewMeta}>
                      {getProvinceName(trip.provinceId)}
                    </Text>

                    <Text style={styles.tripPreviewDate}>
                      {getTripDateText(trip)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Todavía no tienes viajes</Text>

              <Text style={styles.emptyText}>
                Crea tu primer viaje para verlo aquí.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={() => setActiveTab('trips')}
              >
                <Text style={styles.emptyButtonText}>Añadir viaje</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  }

  function renderActiveTab() {
    if (isUserDataLoading) {
      return renderLoadingCard();
    }

    if (loadErrorMessage) {
      return (
        <ErrorState
          title="No se pudo cargar"
          message={loadErrorMessage}
          buttonText="Reintentar"
          onRetry={loadUserData}
        />
      );
    }

    if (activeTab === 'map') {
      return (
        <SpainProvinceMap
          provinceStatuses={provinceStatuses}
          selectedProvince={selectedProvince}
          onSelectProvince={setSelectedProvince}
          onSetProvinceStatus={handleSetProvinceStatus}
          onClearProvinceStatus={handleClearProvinceStatus}
        />
      );
    }

    if (activeTab === 'provinces') {
      return (
        <ProvincesScreenView
          provinceStatuses={provinceStatuses}
          selectedProvince={selectedProvince}
          onSelectProvince={setSelectedProvince}
          onSetProvinceStatus={handleSetProvinceStatus}
          onClearProvinceStatus={handleClearProvinceStatus}
        />
      );
    }

    if (activeTab === 'trips') {
      return (
        <TripsScreenView
          trips={trips}
          onAddTrip={handleAddTrip}
          onCreateTrip={handleAddTrip}
          onUpdateTrip={handleUpdateTrip}
          onDeleteTrip={handleDeleteTrip}
          onSelectTrip={setSelectedProfileTrip}
        />
      );
    }

    if (activeTab === 'challenges') {
      return (
        <ChallengesScreenView
          provinceStatuses={provinceStatuses}
          trips={trips}
        />
      );
    }

    if (activeTab === 'friends') {
      return userId ? (
        <FriendsScreenView userId={userId} />
      ) : (
        <ErrorState
          title="Sesión no encontrada"
          message="Inicia sesión de nuevo para ver tus amigos."
          buttonText="Cerrar sesión"
          onRetry={handleSignOut}
        />
      );
    }

    return renderProfileScreen();
  }

  if (isAuthLoading) {
    return (
      <View style={styles.authLoadingScreen}>
        <ActivityIndicator color={appColors.white} size="large" />
        <Text style={styles.authLoadingText}>Abriendo SpainApp...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !session) {
    return <AuthScreen />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderActiveTab()}
      </ScrollView>

      <SettingsModal
        visible={isSettingsVisible}
        profileName={profileName}
        isSavingName={isProfileNameSaving}
        isChangingPhoto={isProfileImageLoading}
        onClose={() => setIsSettingsVisible(false)}
        onSaveName={handleSaveProfileName}
        onChangePhoto={handleChangeProfileImage}
        onLogout={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
      />

      <Modal
        visible={Boolean(selectedProfileTrip)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedProfileTrip(null)}
      >
        <View style={styles.tripModalOverlay}>
          <View style={styles.tripModalCard}>
            {selectedProfileTrip?.imageUri ? (
              <Image
                source={{ uri: selectedProfileTrip.imageUri }}
                style={styles.tripModalImage}
              />
            ) : (
              <View style={styles.tripModalImagePlaceholder}>
                <Text style={styles.tripModalImagePlaceholderText}>✈️</Text>
              </View>
            )}

            <View style={styles.tripModalContent}>
              <View style={styles.tripModalHeader}>
                <View style={styles.tripModalTitleBlock}>
                  <Text style={styles.tripModalTitle}>
                    {selectedProfileTrip?.name}
                  </Text>

                  <Text style={styles.tripModalSubtitle}>
                    {getProvinceName(selectedProfileTrip?.provinceId)}
                  </Text>
                </View>

                <Pressable
                  style={styles.tripModalCloseButton}
                  onPress={() => setSelectedProfileTrip(null)}
                >
                  <Text style={styles.tripModalCloseButtonText}>×</Text>
                </Pressable>
              </View>

              <Text style={styles.tripModalDate}>
                {selectedProfileTrip ? getTripDateText(selectedProfileTrip) : ''}
              </Text>

              {selectedProfileTrip?.notes ? (
                <Text style={styles.tripModalNotes}>
                  {selectedProfileTrip.notes}
                </Text>
              ) : (
                <Text style={styles.tripModalNotesMuted}>
                  Este viaje no tiene notas.
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomBarWrapper}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Pressable
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>

                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <LegalFooter variant="bottomBar" />
      </View>
    </View>
  );
}const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  authLoadingScreen: {
    flex: 1,
    backgroundColor: appColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  authLoadingText: {
    color: appColors.textSecondary,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 18,
    paddingBottom: 180,
    gap: 18,
  },
  loadingCard: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    gap: 12,
  },
  loadingTitle: {
    color: appColors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  loadingText: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  profileContainer: {
    gap: 18,
  },
  profileHeroCard: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 30,
    padding: 22,
    alignItems: 'center',
  },
  avatarButton: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 2,
    borderColor: appColors.border,
  },
  avatarPlaceholder: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 2,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: appColors.text,
    fontSize: 38,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: appColors.background,
  },
  avatarEditBadgeText: {
    fontSize: 16,
  },
  profileName: {
    color: appColors.text,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  profileSubtitle: {
    color: appColors.textSecondary,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: appFonts.main,
  },
  profileProgressBar: {
    width: '100%',
    height: 12,
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 18,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  profileProgressFill: {
    height: '100%',
    backgroundColor: appColors.visited,
    borderRadius: 999,
  },
  profileProgressText: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
    fontFamily: appFonts.main,
  },
  profileSettingsButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  profileSettingsButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 24,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  statValue: {
    color: appColors.text,
    fontSize: 25,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  statLabel: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
    fontFamily: appFonts.main,
  },
  profileSection: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 28,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitleBlock: {
    flex: 1,
  },
  sectionTitle: {
    color: appColors.text,
    fontSize: 21,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  sectionSubtitle: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    fontFamily: appFonts.main,
  },
  sectionAction: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    textDecorationLine: 'underline',
    fontFamily: appFonts.main,
    marginTop: 4,
  },
  medalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  medalCard: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 22,
    padding: 14,
    alignItems: 'center',
    minHeight: 138,
    justifyContent: 'center',
  },
  medalIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(234, 179, 8, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  medalIconText: {
    fontSize: 28,
  },
  medalTitle: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: appFonts.main,
  },
  medalSubtitle: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
    fontFamily: appFonts.main,
  },
  tripPreviewList: {
    gap: 10,
  },
  tripPreviewCard: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 20,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tripPreviewImage: {
    width: 66,
    height: 66,
    borderRadius: 16,
    backgroundColor: appColors.background,
  },
  tripPreviewImagePlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 16,
    backgroundColor: appColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripPreviewImagePlaceholderText: {
    fontSize: 26,
  },
  tripPreviewInfo: {
    flex: 1,
  },
  tripPreviewName: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripPreviewMeta: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
    fontFamily: appFonts.main,
  },
  tripPreviewDate: {
    color: appColors.textMuted,
    fontSize: 12,
    marginTop: 3,
    fontFamily: appFonts.main,
  },
  emptyCard: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    gap: 9,
  },
  emptyTitle: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  emptyText: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  emptyButton: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  emptyButtonText: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  tripModalCard: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '88%',
    backgroundColor: appColors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: appColors.border,
    overflow: 'hidden',
  },
  tripModalImage: {
    width: '100%',
    height: 250,
    backgroundColor: appColors.surfaceSoft,
  },
  tripModalImagePlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: appColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripModalImagePlaceholderText: {
    fontSize: 52,
  },
  tripModalContent: {
    padding: 20,
    gap: 12,
  },
  tripModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  tripModalTitleBlock: {
    flex: 1,
  },
  tripModalTitle: {
    color: appColors.text,
    fontSize: 26,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripModalSubtitle: {
    color: appColors.textSecondary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
    fontFamily: appFonts.main,
  },
  tripModalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripModalCloseButtonText: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 26,
  },
  tripModalDate: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  tripModalNotes: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: appFonts.main,
  },
  tripModalNotesMuted: {
    color: appColors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: appFonts.main,
  },
  bottomBarWrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 26,
    paddingTop: 8,
    paddingBottom: 7,
    paddingHorizontal: 8,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 3,
    gap: 2,
  },
  tabButtonActive: {
    backgroundColor: appColors.white,
  },
  tabIcon: {
    fontSize: 17,
  },
  tabButtonText: {
    color: appColors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  tabButtonTextActive: {
    color: appColors.black,
  },
});