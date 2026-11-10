import { CmsSection } from "./cms-types";

export const DEFAULT_HOMEPAGE_SECTIONS: CmsSection[] = [
  {
    id: "sec_home_hero",
    type: "hero",
    enabled: true,
    props: {
      badge: "Hope for Vulnerable Children in Ghana",
      title: "Transforming Lives Through Love & Education",
      subtitle:
        "Providing food, shelter, school uniforms, and vocational training to street-connected children in Accra and beyond.",
      imageUrl: "/images/placeholders/home-hero.webp",
      primaryCta: {
        label: "Sponsor a Child",
        href: "/sponsor-a-child",
      },
      secondaryCta: {
        label: "Make a Donation",
        href: "/donate",
      },
      alignment: "center",
    },
  },
  {
    id: "sec_home_mission",
    type: "rich_text",
    enabled: true,
    props: {
      heading: "Our Guiding Mission",
      subheading: "A calling rooted in faith, compassion, and sustainable community empowerment",
      content:
        "LivingHope exists to rescue, educate, and empower street-connected and underprivileged children across Ghana. We believe that poverty should never dictate a child's destiny. Through rigorous academic sponsorship, vocational training, holistic mentorship, and community reintegration, we are breaking cycles of generational poverty one life at a time.",
      containerWidth: "default",
      backgroundColor: "brand",
    },
  },
  {
    id: "sec_home_stats",
    type: "impact_stats",
    enabled: true,
    props: {
      heading: "Our Collective Impact to Date",
      subheading: "Real, audited outcomes made possible by the generosity of donors worldwide",
      useLiveDatabase: true,
      customStats: [
        { value: "450+", label: "Children Enrolled in School" },
        { value: "100%", label: "Direct Support Allocation" },
        { value: "12", label: "Communities Served in Greater Accra" },
        { value: "85+", label: "Vocational Graduates" },
      ],
    },
  },
  {
    id: "sec_home_need",
    type: "image_text",
    enabled: true,
    props: {
      heading: "The Urgency of Our Mission",
      lead: "Thousands of children in Accra sleep on curbs, sell sachets of water at traffic lights, and miss out on basic schooling.",
      paragraphs: [
        "In urban Ghana, extreme poverty and family displacement force children onto the streets as early as age six. Without intervention, they face exploitation, malnutrition, and a lifetime without literacy.",
        "LivingHope provides a secure sanctuary, immediate health interventions, daily nutritious meals, and the loving support needed to re-enter formal schooling.",
      ],
      imageUrl: "/images/placeholders/street-child.webp",
      imageAlt: "Street child looking with hope toward a better future",
      imagePosition: "right",
      bulletPoints: [
        "Safe shelter and daily warm meals",
        "Full school enrollment, books, and uniforms",
        "Continuous healthcare, counselling, and spiritual guidance",
        "Family tracing, mediation, and sustainable reunification",
      ],
      cta: {
        label: "Read About Our Approach",
        href: "/what-we-do",
      },
    },
  },
  {
    id: "sec_home_how_helps",
    type: "card_grid",
    enabled: true,
    props: {
      heading: "How Your Support Changes Everything",
      subheading: "Every dollar invested yields tangible, lasting transformation in a child's life",
      columns: 3,
      cards: [
        {
          title: "Education & Literacy",
          description:
            "Tuition fees, textbooks, school uniforms, and dedicated after-school remedial tutoring.",
          icon: "GraduationCap",
          link: { label: "Learn More", href: "/what-we-do" },
        },
        {
          title: "Nutrition & Medical Care",
          description:
            "Daily balanced lunches, annual medical checkups, dental screening, and emergency healthcare coverage.",
          icon: "HeartHandshake",
          link: { label: "Learn More", href: "/what-we-do" },
        },
        {
          title: "Vocational Skills",
          description:
            "Carpentry, sewing, IT training, and small business apprenticeships for older youth transitioning to adulthood.",
          icon: "Hammer",
          link: { label: "Learn More", href: "/what-we-do" },
        },
      ],
    },
  },
  {
    id: "sec_home_featured_children",
    type: "featured_children",
    enabled: true,
    props: {
      heading: "Children Awaiting a Brightener",
      subheading: "Meet the incredible boys and girls who need your sponsorship today",
      mode: "auto_urgent",
      maxCount: 3,
    },
  },
  {
    id: "sec_home_stories",
    type: "featured_stories",
    enabled: true,
    props: {
      heading: "Stories of Transformation",
      subheading: "Witness how sponsorship and compassion changed their trajectories forever",
      showRecentDonors: true,
    },
  },
  {
    id: "sec_home_brightener_cta",
    type: "partnership_cta",
    enabled: true,
    props: {
      heading: "Become a Brightener Partner",
      subheading:
        "Whether you are an individual, church, foundation, or corporate team, your sustained partnership creates enduring community resilience.",
      buttonLabel: "Explore Brightener Partnerships",
      buttonUrl: "/become-a-brightener",
      backgroundImageUrl: "/images/placeholders/partnership-banner.webp",
    },
  },
  {
    id: "sec_home_donation_cta",
    type: "donation_cta",
    enabled: true,
    props: {
      heading: "Every Child Deserves a Chance to Learn",
      subheading:
        "Your tax-deductible gift directly funds education, food, and security for Ghana's most vulnerable children.",
      presetAmounts: [25, 50, 100, 250],
      primaryCtaLabel: "Make an Immediate Donation",
      accentColor: "#0f766e",
    },
  },
];

export const DEFAULT_ABOUT_SECTIONS: CmsSection[] = [
  {
    id: "sec_about_hero",
    type: "hero",
    enabled: true,
    props: {
      badge: "Founded on Faith & Integrity",
      title: "About LivingHope Ghana",
      subtitle:
        "Dedicated to rescuing, educating, and uplifting vulnerable street-connected children across Greater Accra since 2012.",
      imageUrl: "/images/placeholders/about-hero.webp",
      alignment: "center",
    },
  },
  {
    id: "sec_about_who",
    type: "image_text",
    enabled: true,
    props: {
      heading: "Who We Are",
      lead: "LivingHope is a registered Christian non-profit non-governmental organization operating on the ground in Accra, Ghana.",
      paragraphs: [
        "We partner directly with local schools, traditional community elders, social welfare departments, and international donors to build sustainable rescue and education pathways for children who have fallen through society's safety nets.",
        "Our team consists of passionate Ghanaian social workers, certified teachers, counsellors, and international volunteers united by a shared vision of zero children living or working on the streets.",
      ],
      imageUrl: "/images/placeholders/team-field.webp",
      imageAlt: "LivingHope field workers interacting with children",
      imagePosition: "left",
      bulletPoints: [
        "100% field-tested transparency and financial accountability",
        "Deep collaboration with Ghanaian municipal welfare agencies",
        "Holistic development: spiritual, educational, emotional, physical",
      ],
    },
  },
  {
    id: "sec_about_values",
    type: "card_grid",
    enabled: true,
    props: {
      heading: "Our Guiding Values",
      subheading: "The core principles that govern our decisions, actions, and stewardship",
      columns: 3,
      cards: [
        {
          title: "Faith",
          description: "Rooted in Christ-like love, compassion, and servant leadership for all people.",
          icon: "Heart",
        },
        {
          title: "Passion",
          description: "Relentless enthusiasm for justice, child protection, and holistic community uplift.",
          icon: "Flame",
        },
        {
          title: "Diligence",
          description: "Uncompromising work ethic in education, child safety, and donor stewardship.",
          icon: "ShieldCheck",
        },
        {
          title: "Dependability",
          description: "Consistent follow-through in keeping promises to every child and supporter.",
          icon: "Clock",
        },
        {
          title: "Collaboration",
          description: "Uniting donors, communities, and local authorities for lasting impact.",
          icon: "Users",
        },
      ],
    },
  },
];

export const DEFAULT_WHAT_WE_DO_SECTIONS: CmsSection[] = [
  {
    id: "sec_wwd_hero",
    type: "hero",
    enabled: true,
    props: {
      badge: "Holistic Intervention Model",
      title: "Connecting Generous People to Needy Children",
      subtitle:
        "We bridge the gap between compassionate global donors and children who lack access to food, schooling, and medical attention.",
      imageUrl: "/images/placeholders/what-we-do-hero.webp",
      primaryCta: { label: "Sponsor a Child", href: "/sponsor-a-child" },
      secondaryCta: { label: "Support Our Work", href: "/donate" },
      alignment: "center",
    },
  },
  {
    id: "sec_wwd_programmes",
    type: "programmes",
    enabled: true,
    props: {
      heading: "Our Primary Programmes",
      subheading: "Structured pathways designed to walk with children from the street to self-sufficiency",
      programmes: [
        {
          title: "Street Outreach & First Contact",
          category: "Rescue & Shelter",
          description:
            "Mobile outreach teams visit market stalls and traffic junctions to build trust, provide immediate first aid and food, and invite children to daytime drop-in centres.",
          metrics: "Over 600 children engaged annually",
          imageUrl: "/images/programmes/outreach.webp",
        },
        {
          title: "Formal School Enrollment",
          category: "Education",
          description:
            "We pay school enrollment fees, purchase prescribed uniforms and textbooks, provide desks and bags, and pair students with after-school remedial tutors.",
          metrics: "450+ students currently enrolled in basic school",
          imageUrl: "/images/programmes/education.webp",
        },
        {
          title: "Vocational Skills & Apprenticeships",
          category: "Livelihood",
          description:
            "Older youth learn carpentry, masonry, sewing, coding, and culinary arts under certified master craftspeople to secure independent, dignified employment.",
          metrics: "85+ certified graduates working independently",
          imageUrl: "/images/programmes/vocational.webp",
        },
        {
          title: "Nutrition & Medical Care",
          category: "Healthcare",
          description:
            "Nutritious daily meals, health screenings, vaccinations, and comprehensive clinical care for every child enrolled in our welfare programmes.",
          metrics: "1,200+ clinical consultations funded",
          imageUrl: "/images/programmes/health.webp",
        },
      ],
    },
  },
  {
    id: "sec_wwd_faq",
    type: "faq",
    enabled: true,
    props: {
      heading: "Frequently Asked Questions",
      subheading: "Everything you need to know about our programmes and operational integrity",
      items: [
        {
          question: "How do you select which children receive support?",
          answer:
            "Children are identified through field outreach in high-density informal settlements and market areas in Accra. Our licensed social workers conduct extensive home assessments and vulnerability scoring before formal enrollment.",
        },
        {
          question: "How are donations allocated across administrative and field expenses?",
          answer:
            "100% of recurring monthly child sponsorships go directly to the child's school fees, nutrition, and healthcare. Core administrative costs are funded separately by dedicated foundational grants and private board gifts.",
        },
        {
          question: "Can I correspond with or visit my sponsored child?",
          answer:
            "Yes! We coordinate termly letters, drawings, and academic report cards. Monitored video updates and visits to our Accra centre can be arranged through our sponsorship coordinators with child safeguarding clearance.",
        },
      ],
    },
  },
];

