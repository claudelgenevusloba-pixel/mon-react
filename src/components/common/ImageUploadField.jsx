import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getPublicImageUrl } from "../../utils/media";

const TYPES_IMAGE_AUTORISES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const TAILLE_MAXIMALE = 2 * 1024 * 1024;

export default function ImageUploadField({
  label,
  image,
  file,
  onChange,
  onError,
  disabled = false,
  helperText,
}) {
  const { t } = useLanguage();
  const inputId = useId();
  const inputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const [previewSelection, setPreviewSelection] = useState(null);

  useEffect(() => {
    const objectUrl = previewSelection?.file === file
      ? previewSelection.url
      : null;
    if (!objectUrl) return undefined;

    return () => {
      URL.revokeObjectURL(objectUrl);
      if (previewUrlRef.current === objectUrl) {
        previewUrlRef.current = null;
      }
    };
  }, [file, previewSelection]);

  const preview = file && previewSelection?.file === file
    ? previewSelection.url
    : getPublicImageUrl(image);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) return;

    if (!TYPES_IMAGE_AUTORISES.includes(selectedFile.type)) {
      onError?.(t("Choisissez une image JPG, PNG ou WebP."));
      return;
    }

    if (selectedFile.size > TAILLE_MAXIMALE) {
      onError?.(t("L'image ne doit pas dépasser 2 Mo."));
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    previewUrlRef.current = objectUrl;
    setPreviewSelection({ file: selectedFile, url: objectUrl });
    onChange?.(selectedFile);
  };

  const annulerSelection = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewSelection(null);
    onChange?.(null);
  };

  return (
    <div className="app-image-upload">
      <label htmlFor={inputId} className="app-image-upload__label">
        {label || t("Photo de profil")}
      </label>

      <div className="app-image-upload__content">
        <div className="app-image-upload__preview">
          {preview ? (
            <img src={preview} alt={t("Aperçu de la photo sélectionnée")} />
          ) : (
            <ImagePlus size={24} aria-hidden="true" />
          )}
        </div>

        <div className="app-image-upload__controls">
          <p>{helperText || t("JPG, PNG ou WebP — 2 Mo maximum.")}</p>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={disabled}
            className="app-image-upload__input"
          />
          <div className="app-image-upload__buttons">
            <button
              type="button"
              className="app-image-upload__choose"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              aria-describedby={`${inputId}-help`}
            >
              <Upload size={15} aria-hidden="true" />
              {file
                ? t("Choisir une autre image")
                : t("Ajouter une image")}
            </button>

            {file && (
              <button
                type="button"
                className="app-image-upload__remove"
                onClick={annulerSelection}
                disabled={disabled}
                aria-label={t("Annuler le choix de cette image")}
              >
                <X size={15} />
              </button>
            )}
          </div>
          <span id={`${inputId}-help`} className="app-image-upload__sr-only">
            {helperText || t("JPG, PNG ou WebP — 2 Mo maximum.")}
          </span>
        </div>
      </div>
    </div>
  );
}
