type UserAvatarUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

type UserAvatarProps = {
  user?: UserAvatarUser | null;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
};

export function getUserInitials(user?: UserAvatarUser | null) {
  const letters = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("");

  return (letters || user?.email?.slice(0, 2) || "SE").toUpperCase();
}

export default function UserAvatar({
  user,
  className = "h-10 w-10 rounded-2xl",
  imageClassName = "",
  textClassName = "text-sm font-semibold",
}: UserAvatarProps) {
  const sharedClassName = `inline-flex shrink-0 items-center justify-center overflow-hidden bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20 ${className}`;

  if (user?.avatarUrl) {
    return (
      <span className={sharedClassName}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt="Photo de profil"
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      </span>
    );
  }

  return (
    <span className={`${sharedClassName} ${textClassName}`}>
      {getUserInitials(user)}
    </span>
  );
}
