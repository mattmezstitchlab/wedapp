export type VendorStatus =
  | "À rechercher"
  | "À contacter"
  | "Devis demandé"
  | "Option"
  | "Réservé"
  | "Payé";

export type VendorCategory = "Lieu" | "Traiteur" | "Image" | "Musique" | "Fleurs" | "Beauté";

export type Moment = {
  id: string;
  title: string;
  time: string;
  subtitle: string;
  accent: string;
};

export type Vendor = {
  id: string;
  name: string;
  category: VendorCategory;
  service: string;
  status: VendorStatus;
  price: number;
  availability: string;
  contact: string;
  phone: string;
  notes: string;
  photo: string;
  confirmed: boolean;
};

export type Assignment = {
  id: string;
  vendorId: string;
  momentId: string;
  responsibility: string;
  startTime: string;
  endTime: string;
};

export type Task = {
  id: string;
  title: string;
  detail: string;
  due: string;
  category: string;
  done: boolean;
  urgent?: boolean;
};

export const moments: Moment[] = [
  { id: "prep", title: "Préparatifs", time: "09:00", subtitle: "Les premières émotions", accent: "#C7A38B" },
  { id: "ceremony", title: "Cérémonie", time: "15:00", subtitle: "Le oui", accent: "#8497A8" },
  { id: "cocktail", title: "Cocktail", time: "17:00", subtitle: "À partager", accent: "#D8B56F" },
  { id: "dinner", title: "Dîner", time: "20:00", subtitle: "À table", accent: "#899D87" },
  { id: "party", title: "Soirée", time: "23:00", subtitle: "Jusqu’au bout", accent: "#706B88" },
  { id: "nextday", title: "Lendemain", time: "11:00", subtitle: "Encore un peu", accent: "#A59A8A" },
];

export const vendors: Vendor[] = [
  {
    id: "venue",
    name: "Domaine des Pins",
    category: "Lieu",
    service: "Réception & cérémonie",
    status: "Réservé",
    price: 6800,
    availability: "Confirmé · 14 juin 2025",
    contact: "Camille Laurent",
    phone: "+33 6 18 42 77 20",
    notes: "Prévoir le plan B pluie et le branchement traiteur.",
    photo: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
    confirmed: true,
  },
  {
    id: "caterer",
    name: "Maison Junot",
    category: "Traiteur",
    service: "Dîner 120 personnes",
    status: "Devis demandé",
    price: 9200,
    availability: "Réponse attendue vendredi",
    contact: "Hugo Junot",
    phone: "+33 6 44 02 13 81",
    notes: "Option végétale à confirmer pour 18 convives.",
    photo: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
    confirmed: false,
  },
  {
    id: "photo",
    name: "Léa Martin Studio",
    category: "Image",
    service: "Photo · jour J",
    status: "Option",
    price: 2350,
    availability: "Option posée jusqu’au 4 mai",
    contact: "Léa Martin",
    phone: "+33 6 90 11 28 64",
    notes: "Inclut 8 heures et galerie privée.",
    photo: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    confirmed: false,
  },
  {
    id: "music",
    name: "Les Belles Fréquences",
    category: "Musique",
    service: "DJ & sonorisation",
    status: "À contacter",
    price: 1800,
    availability: "Disponible selon premier échange",
    contact: "Noé Bernard",
    phone: "+33 7 51 88 09 22",
    notes: "Demander la liste du matériel et les horaires de fin.",
    photo: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
    confirmed: false,
  },
  {
    id: "flowers",
    name: "Atelier Pivoine",
    category: "Fleurs",
    service: "Bouquets & scénographie",
    status: "Réservé",
    price: 1680,
    availability: "Palette validée",
    contact: "Zoé Perrin",
    phone: "+33 6 74 52 12 06",
    notes: "Réutiliser les compositions du cocktail pour le dîner.",
    photo: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
    confirmed: true,
  },
  {
    id: "beauty",
    name: "Studio Sillage",
    category: "Beauté",
    service: "Maquillage & coiffure",
    status: "À rechercher",
    price: 960,
    availability: "Disponibilité à vérifier",
    contact: "À attribuer",
    phone: "—",
    notes: "Prévoir deux essais et trois personnes le matin.",
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    confirmed: false,
  },
];

export const assignments: Assignment[] = [
  { id: "a-venue", vendorId: "venue", momentId: "ceremony", responsibility: "Accueil & cérémonie", startTime: "14:00", endTime: "18:00" },
  { id: "a-photo-1", vendorId: "photo", momentId: "prep", responsibility: "Préparatifs", startTime: "09:00", endTime: "13:00" },
  { id: "a-photo-2", vendorId: "photo", momentId: "party", responsibility: "Piste & moments forts", startTime: "22:30", endTime: "01:00" },
  { id: "a-caterer", vendorId: "caterer", momentId: "dinner", responsibility: "Service du dîner", startTime: "19:30", endTime: "23:00" },
  { id: "a-flowers", vendorId: "flowers", momentId: "cocktail", responsibility: "Installation florale", startTime: "15:30", endTime: "18:30" },
];

export const tasks: Task[] = [
  { id: "task-1", title: "Valider le menu végétal", detail: "Maison Junot · dîner", due: "Aujourd’hui", category: "Traiteur", done: false, urgent: true },
  { id: "task-2", title: "Partager le déroulé avec Léa", detail: "Léa Martin Studio · photo", due: "Demain", category: "Image", done: false },
  { id: "task-3", title: "Envoyer les horaires au domaine", detail: "Domaine des Pins · coordination", due: "18 avril", category: "Lieu", done: true },
  { id: "task-4", title: "Choisir la playlist cocktail", detail: "Les Belles Fréquences · musique", due: "20 avril", category: "Musique", done: false },
  { id: "task-5", title: "Confirmer l’essai coiffure", detail: "Studio Sillage · beauté", due: "22 avril", category: "Beauté", done: false },
];

export const eventInfo = {
  name: "Mariage d’Élise & Thomas",
  date: "Samedi 14 juin 2025",
  location: "Domaine des Pins · Provence",
  daysToGo: 68,
};
