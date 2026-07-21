// Doit rester synchronisé avec l'enum MerchantCategory et les libellés
// définis dans gatinelle-app/src/lib/merchantCategory.ts (les deux dépôts
// ne partagent pas de code).
export const MERCHANT_CATEGORY_OPTIONS = [
  { value: "ALIMENTATION", label: "Alimentation / épicerie" },
  { value: "BOULANGERIE_PATISSERIE", label: "Boulangerie / pâtisserie" },
  { value: "RESTAURANT_CAFE_BAR", label: "Restaurant / café / bar" },
  { value: "PRODUCTEUR_MARCHE", label: "Producteur local / marché" },
  { value: "ARTISANAT", label: "Artisanat" },
  { value: "COMMERCE_BOUTIQUE", label: "Commerce / boutique" },
  { value: "BATIMENT_HABITAT", label: "Bâtiment / habitat" },
  { value: "SANTE_BIEN_ETRE", label: "Santé / bien-être" },
  { value: "BEAUTE_COIFFURE", label: "Beauté / coiffure" },
  { value: "CULTURE_LOISIRS", label: "Culture / loisirs" },
  { value: "TOURISME_HEBERGEMENT", label: "Tourisme / hébergement" },
  { value: "SPORT", label: "Sport" },
  { value: "SERVICES_PERSONNE", label: "Services à la personne" },
  { value: "SERVICES_PROFESSIONNELS", label: "Services professionnels" },
  { value: "TRANSPORT_MOBILITE", label: "Transport / mobilité" },
  { value: "EDUCATION_FORMATION", label: "Éducation / formation" },
  { value: "AUTRE", label: "Autre" },
] as const;

export type MerchantCategory = (typeof MERCHANT_CATEGORY_OPTIONS)[number]["value"];

export function merchantCategoryLabel(value: string): string {
  return MERCHANT_CATEGORY_OPTIONS.find((opt) => opt.value === value)?.label ?? value;
}
