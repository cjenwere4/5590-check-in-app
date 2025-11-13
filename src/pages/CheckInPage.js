import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../lib/supabaseClient';

function CheckInPage() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Detecting location…');
  const [coordinates, setCoordinates] = useState(null);
  const [capturedAt, setCapturedAt] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    const resolveHumanReadableLocation = async (latitude, longitude) => {
      const fallbackLabel = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

      if (!isCancelled) {
        setLocation(`${fallbackLabel} (resolving address…)`);
        setIsResolvingAddress(true);
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`
        );

        if (!response.ok) {
          throw new Error('Failed to resolve address');
        }

        const data = await response.json();
        const displayName = formatAddressFromResponse(data?.address) ?? data?.display_name;

        if (!isCancelled) {
          setLocation(
            displayName ? displayName : `${fallbackLabel} (address unavailable)`
          );
        }
      } catch (error) {
        if (!isCancelled) {
          setLocation(`${fallbackLabel} (could not fetch address)`);
        }
      } finally {
        if (!isCancelled) {
          setIsResolvingAddress(false);
        }
      }
    };

    if (!navigator.geolocation) {
      setLocation('Location services not supported in this browser');
      setIsLocating(false);
      return () => {
        isCancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isCancelled) {
          return;
        }

        const { latitude, longitude, accuracy } = position.coords;
        setCoordinates({
          latitude,
          longitude,
          accuracy: typeof accuracy === 'number' ? accuracy : null,
        });
        setCapturedAt(new Date(position.timestamp || Date.now()).toISOString());
        setIsLocating(false);
        resolveHumanReadableLocation(latitude, longitude);
      },
      (error) => {
        if (isCancelled) {
          return;
        }

        setCoordinates(null);
        setCapturedAt(null);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocation('Permission denied. Enable location access to proceed.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocation('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocation('Timed out while retrieving location.');
            break;
          default:
            setLocation('An unknown error occurred retrieving location.');
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );

    return () => {
      isCancelled = true;
    };
  }, []);

  const isBusy = isLocating || isResolvingAddress || isSubmitting;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || isBusy) {
      return;
    }

    setSubmitError(null);

    const trimmedName = name.trim();
    let checkInLogged = false;

    const supabaseClient = await getSupabaseClient();

    if (supabaseClient) {
      setIsSubmitting(true);
      try {
        const payload = {
          session_id: sessionId,
          event_label: '5590-check-in',
          name: trimmedName,
          address: location,
          latitude: coordinates?.latitude ?? null,
          longitude: coordinates?.longitude ?? null,
          accuracy_m: coordinates?.accuracy ?? null,
          captured_at: capturedAt ?? new Date().toISOString(),
          location_source: coordinates ? 'browser-geolocation' : 'unavailable',
          device_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        };

        const { error } = await supabaseClient.from('check_ins').insert(payload);
        if (error) {
          throw error;
        }
        checkInLogged = true;
      } catch (error) {
        console.error('Failed to log check-in with Supabase', error);
        setSubmitError('We saved your check-in locally but could not sync it. Please let the host know.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.warn('Supabase configuration missing; skipping remote logging.');
    }

    navigate('/icebreakers', {
      state: {
        name: trimmedName,
        location,
        checkInLogged,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
            Welcome to 5590
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Check in to confirm your arrival.
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-400">
            We’ll confirm your presence and capture your location to curate a personalized event experience.
          </p>
        </div>
        <div className="relative w-full max-w-3xl">
          <div
            className="absolute inset-0 -translate-y-8 rounded-[32px] bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 opacity-40 blur-3xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl shadow-sky-950/60 backdrop-blur-xl">
            <div className="border-b border-white/10 bg-white/[0.07] px-10 py-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
                    Guest Services
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Event Check-In</h2>
                </div>
                <div className="rounded-full bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-200 ring-1 ring-inset ring-sky-400/30">
                  {isLocating
                    ? 'Locating'
                    : isResolvingAddress
                      ? 'Resolving Address'
                      : 'Ready'}
                </div>
              </div>
            </div>
            <form className="space-y-8 px-10 py-10" onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-200"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                    className="mt-3 block w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-500 transition focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="location"
                    className="text-sm font-medium text-slate-200"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    disabled
                    className="mt-3 block w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-slate-200 shadow-inner transition disabled:text-slate-400"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    We use your precise coordinates to tailor the agenda. Your information stays private and secure.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 px-5 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-300 focus-visible:ring-offset-slate-900 disabled:cursor-wait disabled:opacity-60"
                >
                  {isLocating
                    ? 'Detecting your location…'
                    : isResolvingAddress
                      ? 'Polishing your address…'
                      : isSubmitting
                        ? 'Logging your check-in…'
                        : 'Complete Check-In'}
                </button>
                {submitError && (
                  <p className="text-sm text-amber-300">{submitError}</p>
                )}
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="inline-flex h-2.5 w-2.5 translate-y-1 rounded-full bg-emerald-400" />
                  <p>
                    Your coordinates are encrypted in transit. We never share your location outside of the concierge team.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatAddressFromResponse(address) {
  if (!address) {
    return null;
  }

  const street = [address.house_number, address.road]
    .filter(Boolean)
    .join(' ')
    .trim();

  const locality =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.suburb ||
    address.neighbourhood;

  const regionParts = [address.state, address.postcode].filter(Boolean);
  const country = address.country;

  const segments = [street || address.residential, locality, regionParts.join(' '), country]
    .filter((segment) => segment && segment.length > 0)
    .map((segment) => segment.replace(/\s+/g, ' ').trim());

  if (segments.length === 0) {
    return null;
  }

  const uniqueSegments = segments.filter(
    (segment, index) => segments.findIndex((item) => item.toLowerCase() === segment.toLowerCase()) === index
  );

  return uniqueSegments.join(', ');
}

export default CheckInPage;

