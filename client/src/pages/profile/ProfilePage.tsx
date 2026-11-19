
import { useState, type FormEvent } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth.service";
import { ShimmerLabel } from "../../components/common/LoadingShimmer";

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || "Something went wrong.";
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong.";
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setProfileError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setProfileError("Name cannot be empty.");
      return;
    }

    if (trimmedName === user.name) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSavingProfile(true);

      const updatedUser = await authService.updateProfile({
        name: trimmedName,
      });

      updateUser(updatedUser);
      setName(updatedUser.name);
      setIsEditing(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setIsChangingPassword(true);

      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      {/* Profile overview */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {initials}
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-slate-900">
              {user.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {user.email}
            </p>

            <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {user.role}
            </span>
          </div>
        </div>
      </section>

      {/* Account information */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-800">
            Account Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your account details.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <InfoItem
            icon={<User size={18} />}
            label="Full Name"
            value={user.name}
          />

          <InfoItem
            icon={<Mail size={18} />}
            label="Email Address"
            value={user.email}
          />

          <InfoItem
            icon={<ShieldCheck size={18} />}
            label="Account Role"
            value={user.role}
          />

          <InfoItem
            icon={<CalendarDays size={18} />}
            label="Account ID"
            value={user.id}
          />
        </div>
      </section>

      {/* Edit profile */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              Personal Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update your profile details.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setName(user.name);
                setProfileError("");
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!isEditing || isSavingProfile}
              maxLength={100}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email Address
            </label>

            <input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              Email address cannot be changed here.
            </p>
          </div>

          {profileError && (
            <Feedback message={profileError} />
          )}

          {isEditing && (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {isSavingProfile ? (
                  <ShimmerLabel label="Saving profile" className="h-4 w-20" />
                ) : (
                  "Save Changes"
                )}
              </button>

              <button
                type="button"
                disabled={isSavingProfile}
                onClick={() => {
                  setName(user.name);
                  setProfileError("");
                  setIsEditing(false);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
            <LockKeyhole size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-800">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your account secure with a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <PasswordInput
            id="current-password"
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrentPassword}
            onToggle={() =>
              setShowCurrentPassword((previous) => !previous)
            }
          />

          <PasswordInput
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            onToggle={() =>
              setShowNewPassword((previous) => !previous)
            }
          />

          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            onToggle={() =>
              setShowConfirmPassword((previous) => !previous)
            }
          />

          <p className="text-xs text-slate-400">
            Use at least 8 characters. Your backend should enforce the
            actual password policy.
          </p>

          {passwordError && (
            <Feedback message={passwordError} />
          )}

          <button
            type="submit"
            disabled={isChangingPassword}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={16} />
            {isChangingPassword ? (
              <ShimmerLabel
                label="Updating password"
                className="h-4 w-20"
              />
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-start gap-3">
    <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  </div>
);

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
}: PasswordInputProps) => (
  <div>
    <label
      htmlFor={id}
      className="mb-2 block text-sm font-medium text-slate-700"
    >
      {label}
    </label>

    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="password-input w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const Feedback = ({ message }: { message: string }) => (
  <div
    role="alert"
    className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
  >
    <AlertCircle size={18} className="shrink-0" />
    <span>{message}</span>
  </div>
);

export default ProfilePage;
