import commercial from "@/assets/commercial.jpg";
import office from "@/assets/office.jpg";
import marketing from "@/assets/marketing.jpg";
import education from "@/assets/education.jpg";
import event from "@/assets/event.jpg";
import custom from "@/assets/custom.jpg";

export type ServiceCategory = {
  slug: string;
  title: string;
  tagline: string;
  image: string;
  items: string[];
};

export const services: ServiceCategory[] = [
  {
    slug: "commercial",
    title: "Commercial Printing",
    tagline: "Sharp, professional print collateral that represents your brand.",
    image: commercial,
    items: [
      "Business Cards",
      "Letterheads",
      "Envelopes",
      "Company Profiles",
      "Brochures",
      "Flyers",
      "Catalogs",
      "Annual Reports",
      "Presentation Folders",
    ],
  },
  {
    slug: "office",
    title: "Office & Corporate Printing",
    tagline: "Reliable everyday essentials that keep operations running.",
    image: office,
    items: [
      "Invoice Books",
      "Cash Memo Books",
      "Receipt Books",
      "Notepads",
      "File Folders",
      "Office Stationery",
      "ID Cards",
    ],
  },
  {
    slug: "marketing",
    title: "Marketing Materials",
    tagline: "Bold, vivid pieces built to attract attention and convert.",
    image: marketing,
    items: [
      "Posters",
      "Banners",
      "Roll-Up Stands",
      "Stickers",
      "Labels",
      "Promotional Materials",
    ],
  },
  {
    slug: "educational",
    title: "Educational Printing",
    tagline: "Trusted print production for schools and institutions.",
    image: education,
    items: [
      "Books",
      "Exercise Books",
      "Certificates",
      "Report Cards",
      "School Diaries",
      "Admission Forms",
    ],
  },
  {
    slug: "event",
    title: "Event & Personal Printing",
    tagline: "Beautiful print for the moments that matter.",
    image: event,
    items: [
      "Wedding Invitations",
      "Greeting Cards",
      "Invitation Cards",
      "Certificates",
      "Personalized Print Products",
    ],
  },
  {
    slug: "custom",
    title: "Custom Printing",
    tagline: "Tailored solutions built around your exact requirements.",
    image: custom,
    items: [
      "Custom Sizes & Materials",
      "Specialty Finishes",
      "Bulk Production",
      "Bespoke Print Projects",
    ],
  },
];
