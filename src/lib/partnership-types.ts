import { User, Users, Briefcase, Church, Gift, HeartHandshake } from "lucide-react";
import type { PartnershipType } from "@/generated/prisma/enums";

/**
 * Two copy variants per type, matching the live site: a short "teaser" used on the
 * homepage cards, and the fuller `description` used on the dedicated
 * Become a Brightener page. `showOnHome: false` (Church) mirrors the live homepage,
 * which only surfaces 5 of the 6 options there.
 */
export const PARTNERSHIP_TYPES: {
  type: PartnershipType;
  title: string;
  teaser: string;
  description: string;
  icon: typeof User;
  showOnHome: boolean;
}[] = [
  {
    type: "INDIVIDUAL",
    title: "Individual Partner",
    teaser:
      "Your personal generosity directly funds a child's education, providing the school supplies, meals, and steady support they need to thrive.",
    description:
      "You can pick one or more children to support — contribute to their fund, or sponsor them fully all by yourself.",
    icon: User,
    showOnHome: true,
  },
  {
    type: "GROUP",
    title: "Group Partnership",
    teaser:
      "Bring your community, school, or faith group together — your collective fundraising power can sponsor major projects and make a real difference.",
    description:
      "Bring your community, school, alumni, work colleagues, special friends, or family together to make an impact through small contributions that add up to a huge impact.",
    icon: Users,
    showOnHome: true,
  },
  {
    type: "CORPORATE",
    title: "Corporate Partnership",
    teaser:
      "Showcase your company's commitment to social responsibility — your partnership funds large-scale projects and transforms communities.",
    description:
      "Show your company's commitment to social responsibility by giving a deprived street child a chance to face the future with hope.",
    icon: Briefcase,
    showOnHome: true,
  },
  {
    type: "CHURCH",
    title: "Church Partnership",
    teaser:
      "As a church, share the love of God outside the walls of your congregation by sponsoring one or more children.",
    description:
      "As a church, share the love of God outside the walls of your congregation by sponsoring one or more children.",
    icon: Church,
    showOnHome: false,
  },
  {
    type: "WILL_GIFT",
    title: "Will Gift",
    teaser:
      "Create an enduring legacy of hope that will shine for generations. A planned gift in your will ensures our vital work continues.",
    description:
      "When you can no longer benefit from what you've been blessed with, a planned gift in your will can brighten the lives of children still living in need.",
    icon: Gift,
    showOnHome: true,
  },
  {
    type: "VOLUNTEER",
    title: "Volunteer Your Service",
    teaser:
      "Give your most valuable asset by sharing your unique time and skills. Become a hands-on spark that helps our mission succeed.",
    description:
      "Your time and talent can be the spark that helps our mission succeed. Find opportunities to contribute hands-on and make a direct impact.",
    icon: HeartHandshake,
    showOnHome: true,
  },
];
