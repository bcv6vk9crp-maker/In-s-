export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = "lang";

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}

const fr = {
  nav: { collections: "Collections", about: "À propos", contact: "Contact", cart: "Panier" },
  home: {
    all: "Toutes les photos",
    from: "dès",
    empty: "Les photos arrivent bientôt.",
    intro: "Des tirages d'art en 20 × 30 et 40 × 60 cm, avec ou sans cadre.",
  },
  photo: {
    format: "Format",
    frame: "Cadre",
    noFrame: "Sans cadre",
    withFrame: "Avec cadre",
    quantity: "Quantité",
    total: "Total",
    addToCart: "Ajouter au panier",
    added: "Ajouté au panier",
    viewCart: "Voir le panier",
    noPayment: "Aucun paiement en ligne. Ines vous recontacte pour finaliser la commande.",
    back: "Retour à la galerie",
  },
  cart: {
    title: "Votre panier",
    empty: "Votre panier est vide.",
    browse: "Découvrir les photos",
    remove: "Retirer",
    total: "Total estimé",
    shippingNote: "Hors frais de port éventuels, à définir avec la photographe.",
    checkout: "Valider mon panier",
    unavailable: "Cette photo n'est plus disponible et a été retirée du panier.",
  },
  checkout: {
    title: "Vos coordonnées",
    lead: "Aucun paiement ici : en validant, vous transmettez votre demande à Ines, qui vous recontacte pour confirmer la commande et convenir du paiement.",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone (facultatif)",
    delivery: "Réception",
    pickup: "Retrait en main propre",
    shipping: "Livraison à domicile",
    shippingNote: "Frais de port à définir avec la photographe.",
    address: "Adresse",
    postalCode: "Code postal",
    city: "Ville",
    country: "Pays",
    message: "Message (facultatif)",
    messageHint: "Une préférence de cadre, une dédicace, un délai souhaité…",
    consent: "J'accepte que mes informations soient transmises à Ines. B pour être recontacté·e afin de finaliser ma commande et son paiement.",
    privacy: "Politique de confidentialité",
    submit: "Envoyer ma commande",
    sending: "Envoi…",
    summary: "Récapitulatif",
    emptyCart: "Votre panier est vide.",
    error: "La commande n'a pas pu être envoyée. Vérifiez les champs signalés puis réessayez.",
  },
  thanks: {
    title: "Merci !",
    body: "Votre commande {number} a bien été transmise. Ines vous recontacte très vite par email ou téléphone pour la confirmer et convenir du paiement. Un récapitulatif vient de vous être envoyé.",
    back: "Retour à la galerie",
  },
  footer: { legal: "Mentions légales", terms: "Conditions de vente", privacy: "Confidentialité" },
  about: { title: "À propos" },
  contact: { title: "Contact", email: "Email", instagram: "Instagram" },
};

type Dict = typeof fr;

const en: Dict = {
  nav: { collections: "Collections", about: "About", contact: "Contact", cart: "Cart" },
  home: {
    all: "All photos",
    from: "from",
    empty: "Photos coming soon.",
    intro: "Fine art prints in 20 × 30 and 40 × 60 cm, framed or unframed.",
  },
  photo: {
    format: "Size",
    frame: "Frame",
    noFrame: "No frame",
    withFrame: "Framed",
    quantity: "Quantity",
    total: "Total",
    addToCart: "Add to cart",
    added: "Added to cart",
    viewCart: "View cart",
    noPayment: "No online payment. Ines will contact you to finalise your order.",
    back: "Back to the gallery",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty.",
    browse: "Browse the photos",
    remove: "Remove",
    total: "Estimated total",
    shippingNote: "Shipping costs, if any, to be agreed with the photographer.",
    checkout: "Confirm my cart",
    unavailable: "This photo is no longer available and was removed from your cart.",
  },
  checkout: {
    title: "Your details",
    lead: "No payment here: by confirming, you send your request to Ines, who will contact you to confirm the order and arrange payment.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone (optional)",
    delivery: "Delivery",
    pickup: "Collect in person",
    shipping: "Home delivery",
    shippingNote: "Shipping costs to be agreed with the photographer.",
    address: "Address",
    postalCode: "Postcode",
    city: "City",
    country: "Country",
    message: "Message (optional)",
    messageHint: "A frame preference, a dedication, a preferred date…",
    consent: "I agree that my details are sent to Ines. B so she can contact me to finalise my order and its payment.",
    privacy: "Privacy policy",
    submit: "Send my order",
    sending: "Sending…",
    summary: "Summary",
    emptyCart: "Your cart is empty.",
    error: "Your order could not be sent. Check the highlighted fields and try again.",
  },
  thanks: {
    title: "Thank you!",
    body: "Your order {number} has been sent. Ines will contact you shortly by email or phone to confirm it and arrange payment. A summary has been emailed to you.",
    back: "Back to the gallery",
  },
  footer: { legal: "Legal notice", terms: "Terms of sale", privacy: "Privacy" },
  about: { title: "About" },
  contact: { title: "Contact", email: "Email", instagram: "Instagram" },
};

export const dictionaries: Record<Locale, Dict> = { fr, en };
export type Dictionary = Dict;

/** Choisit le texte dans la langue demandée, avec repli sur le français. */
export function pick(locale: Locale, frText: string, enText: string | null | undefined): string {
  return locale === "en" && enText ? enText : frText;
}
