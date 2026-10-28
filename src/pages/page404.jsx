import { useLanguage } from "../context/LanguageContext";
import React from 'react'

const page404 = () => {
  const { t } = useLanguage();
  return (
    <div>
        <h1>{t("page404")}</h1>
        <p>{t("Désolé, la page que vous recherchez n'existe pas.")}</p>
    </div>
  )
}

export default page404