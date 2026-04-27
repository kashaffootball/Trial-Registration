import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import TrialDetailsCard from './components/TrialDetailsCard';
import PlayerForm from './components/PlayerForm';
import ThankYouPanel from './components/ThankYouPanel';
import TrialDetailsEditor from './components/TrialDetailsEditor';
import ApplicationsTable from './components/ApplicationsTable';
import Footer from './components/Footer';
import { useTrial } from './hooks/useTrial';
import { useClubPublic } from './hooks/useClubPublic';
import { useApplications } from './hooks/useApplications';
import { loginUser, logoutUser } from './services/auth';
import { getClubProfile } from './services/profiles';
import { updateApplicationStatus, updateTrial } from './services/trials';
import { EmailAlreadyRegisteredError, submitApplication } from './lib/submitApplication';
import type { TrialApplication } from './services/types';
import type { PlayerFormInput } from './lib/submitApplication';

const trialObjectId = import.meta.env.VITE_TRIAL_OBJECT_ID as string;

const getUserToken = (user: Record<string, unknown>): string =>
  String((user['user-token'] as string | undefined) ?? (user.userToken as string | undefined) ?? '');

function App() {
  const queryClient = useQueryClient();
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [ownerSession, setOwnerSession] = useState<{
    token: string;
    userId: string;
    clubObjectId: string;
  } | null>(null);

  const trialQuery = useTrial();
  const trial = trialQuery.data;

  const derivedClubObjectId = trial?.club
    ? (Array.isArray(trial.club) ? trial.club[0]?.objectId : trial.club?.objectId)
    : undefined;
  const clubPublicQuery = useClubPublic(
    ownerSession?.clubObjectId || derivedClubObjectId,
    ownerSession?.token,
  );
  const publicClub = clubPublicQuery.data;

  const appsQuery = useApplications(ownerSession?.clubObjectId, ownerSession?.token);

  const applyMutation = useMutation({
    mutationFn: ({ values, trialId }: { values: PlayerFormInput; trialId: string }) =>
      submitApplication(values, trialId),
    onSuccess: () => {
      setFormError(null);
      setSubmitted(true);
    },
    onError: (error: unknown) => {
      if (error instanceof EmailAlreadyRegisteredError) {
        setFormError(error.message);
        return;
      }
      setFormError(error instanceof Error ? error.message : 'Submission failed. Please try again.');
    },
  });

  const trialSaveMutation = useMutation({
    mutationFn: (payload: {
      trialName: string;
      trialDateTime: string;
      location: string;
      price: number;
    }) => updateTrial(trialObjectId, payload, ownerSession!.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trial', trialObjectId] });
    },
  });

  const ownerLoginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const user = (await loginUser({ email, password })) as Record<string, unknown>;
      const token = getUserToken(user);
      const userId = String(user.objectId || '');
      if (!token || !userId) throw new Error('Invalid login response');

      const club = await getClubProfile(userId, token);
      if (!club?.objectId) throw new Error('No club profile found for this account.');

      return { token, userId, clubObjectId: club.objectId };
    },
    onSuccess: (data) => {
      setOwnerSession(data);
      setShowLogin(false);
      setLoginError(null);
    },
    onError: (error: unknown) => {
      setLoginError(error instanceof Error ? error.message : 'Unable to login.');
    },
  });

  const ownerMode = !!ownerSession;

  const onTogglePaid = async (app: TrialApplication, paid: boolean) => {
    if (!ownerSession) return;
    await updateApplicationStatus(
      app.objectId,
      app.status || 'applied',
      paid ? 'paid' : 'pending',
      ownerSession.token,
    );
    queryClient.invalidateQueries({ queryKey: ['clubApplications', ownerSession.clubObjectId] });
  };

  const mainContent = useMemo(() => {
    if (trialQuery.isLoading) {
      return <p className="text-subtle">Loading trial...</p>;
    }

    if (trialQuery.error) {
      const isNetworkError =
        trialQuery.error instanceof TypeError &&
        trialQuery.error.message.toLowerCase().includes('fetch');
      return (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a9 9 0 0118 0M6.343 10.657a5 5 0 017.314 0M9.88 14.12a1 1 0 101.414 1.414" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
          </svg>
          <p className="font-kashafBold text-lg text-white">
            {isNetworkError ? 'No Internet Connection' : 'Unable to Load Trial'}
          </p>
          <p className="text-sm text-subtle">
            {isNetworkError
              ? 'Please check your connection and try again.'
              : 'Something went wrong. Please try again later.'}
          </p>
          <button
            type="button"
            onClick={() => trialQuery.refetch()}
            className="mt-2 rounded-xl bg-primary px-5 py-2 text-sm font-kashafBold text-bg hover:opacity-90"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!trial) {
      return (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="font-kashafBold text-lg text-white">Trial Not Found</p>
          <p className="text-sm text-subtle">This trial is no longer available.</p>
        </div>
      );
    }

    if (ownerMode) {
      return (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={async () => {
                await logoutUser(ownerSession.token);
                setOwnerSession(null);
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white"
            >
              Logout
            </button>
          </div>

          <TrialDetailsEditor
            trial={trial}
            loading={trialSaveMutation.isPending}
            onSave={async (payload) => {
              await trialSaveMutation.mutateAsync(payload);
            }}
          />

          <ApplicationsTable rows={appsQuery.data || []} onTogglePaid={onTogglePaid} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <TrialDetailsCard trial={trial} />

        {!submitted ? (
          <PlayerForm
            loading={applyMutation.isPending}
            error={formError}
            onSubmit={async (values) => {
              await applyMutation.mutateAsync({ values, trialId: trialObjectId });
            }}
          />
        ) : (
          <ThankYouPanel />
        )}
      </div>
    );
  }, [
    appsQuery.data,
    applyMutation,
    formError,
    ownerMode,
    ownerSession,
    submitted,
    trial,
    trialObjectId,
    trialQuery.isLoading,
    trialQuery.error,
    trialQuery.refetch,
    trialSaveMutation,
  ]);

  return (
    <div className="min-h-screen text-text">
      <Header clubLogoUrl={publicClub?.logoUrl || undefined} onOwnerTrigger={() => setShowLogin(true)} />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{mainContent}</main>

      <Footer />

      <LoginModal
        open={showLogin}
        loading={ownerLoginMutation.isPending}
        error={loginError}
        onClose={() => {
          setShowLogin(false);
          setLoginError(null);
        }}
        onSubmit={async (email, password) => {
          await ownerLoginMutation.mutateAsync({ email, password });
        }}
      />
    </div>
  );
}

export default App;
