import { useState } from "react";
import { getInitials } from "../../utils/formatters";
import { getPublicImageUrl } from "../../utils/media";

export default function Avatar({
  src,
  name = "",
  initials,
  size = "medium",
  className = "",
}) {
  const imageUrl = getPublicImageUrl(src);
  const [urlEnErreur, setUrlEnErreur] = useState("");
  const imageFailed = urlEnErreur === imageUrl;

  return (
    <span
      className={`app-avatar app-avatar--${size} ${className}`.trim()}
      role="img"
      aria-label={name || "Photo de profil"}
    >
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt=""
          onError={() => setUrlEnErreur(imageUrl)}
        />
      ) : (
        <span aria-hidden="true">{initials || getInitials(name)}</span>
      )}
    </span>
  );
}
