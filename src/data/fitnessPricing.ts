export interface MembershipType {
  id: string;
  label: string;
  icon: string;
  description: string;
  tiers: MembershipTier[];
  addOns: MembershipAddOn[];
}

export interface MembershipTier {
  id: string;
  label: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  features: string[];
}

export interface MembershipAddOn {
  id: string;
  label: string;
  description: string;
  monthlyPrice: number;
}

export const MEMBERSHIP_TYPES: MembershipType[] = [
  {
    id: 'basic_gym',
    label: 'Basic Gym Access',
    icon: 'Dumbbell',
    description: 'Full access to gym floor equipment, cardio machines, and free weights.',
    tiers: [
      {
        id: 'basic_single',
        label: 'Individual',
        monthlyPrice: 29,
        annualMonthlyPrice: 24,
        features: [
          'Unlimited gym floor access',
          'Locker room & showers',
          'Free fitness assessment',
          'Mobile app access',
        ],
      },
      {
        id: 'basic_couple',
        label: 'Couple',
        monthlyPrice: 49,
        annualMonthlyPrice: 42,
        features: [
          'Everything in Individual (x2)',
          'Shared guest pass (1/month)',
          'Couples workout plans',
        ],
      },
      {
        id: 'basic_family',
        label: 'Family (up to 4)',
        monthlyPrice: 79,
        annualMonthlyPrice: 67,
        features: [
          'Everything in Couple',
          'Up to 4 family members',
          'Kids zone access (ages 6-15)',
          '2 guest passes per month',
        ],
      },
    ],
    addOns: [
      {
        id: 'basic_towel',
        label: 'Towel Service',
        description: 'Fresh towels provided every visit',
        monthlyPrice: 10,
      },
      {
        id: 'basic_parking',
        label: 'Reserved Parking',
        description: 'Guaranteed parking spot during peak hours',
        monthlyPrice: 15,
      },
    ],
  },
  {
    id: 'premium_all_access',
    label: 'Premium All-Access',
    icon: 'Crown',
    description: 'Unlimited access to gym, all group classes, pool, sauna, and recovery zone.',
    tiers: [
      {
        id: 'premium_single',
        label: 'Individual',
        monthlyPrice: 59,
        annualMonthlyPrice: 49,
        features: [
          'Full gym + all group classes',
          'Pool & sauna access',
          'Recovery zone (foam rollers, stretching area)',
          'Free InBody scan monthly',
          '1 guest pass per month',
        ],
      },
      {
        id: 'premium_couple',
        label: 'Couple',
        monthlyPrice: 99,
        annualMonthlyPrice: 84,
        features: [
          'Everything in Individual (x2)',
          '2 guest passes per month',
          'Priority class booking',
        ],
      },
      {
        id: 'premium_family',
        label: 'Family (up to 4)',
        monthlyPrice: 149,
        annualMonthlyPrice: 127,
        features: [
          'Everything in Couple',
          'Up to 4 family members',
          'Kids programming & swim lessons',
          '4 guest passes per month',
          'Family locker room',
        ],
      },
    ],
    addOns: [
      {
        id: 'premium_cryo',
        label: 'Cryotherapy Sessions',
        description: '4 cryo sessions per month',
        monthlyPrice: 60,
      },
      {
        id: 'premium_nutrition',
        label: 'Nutrition Coaching',
        description: 'Monthly check-in with a certified nutritionist',
        monthlyPrice: 45,
      },
      {
        id: 'premium_towel',
        label: 'Towel & Laundry Service',
        description: 'Fresh towels + workout clothes laundered',
        monthlyPrice: 25,
      },
    ],
  },
  {
    id: 'personal_training',
    label: 'Personal Training Packages',
    icon: 'UserCheck',
    description: 'One-on-one sessions with certified personal trainers tailored to your goals.',
    tiers: [
      {
        id: 'pt_starter',
        label: '4 Sessions / Month',
        monthlyPrice: 199,
        annualMonthlyPrice: 169,
        features: [
          '4 x 60-min sessions with a certified trainer',
          'Custom workout plan',
          'Progress tracking via app',
          'Includes Basic Gym Access',
        ],
      },
      {
        id: 'pt_committed',
        label: '8 Sessions / Month',
        monthlyPrice: 349,
        annualMonthlyPrice: 299,
        features: [
          '8 x 60-min sessions with a certified trainer',
          'Custom workout + meal plan',
          'Weekly progress check-ins',
          'Includes Premium All-Access',
        ],
      },
      {
        id: 'pt_elite',
        label: '12 Sessions / Month',
        monthlyPrice: 499,
        annualMonthlyPrice: 429,
        features: [
          '12 x 60-min sessions (3x/week)',
          'Dedicated elite trainer',
          'Full nutrition + supplement guidance',
          'Monthly body composition analysis',
          'Includes Premium All-Access',
          'Priority scheduling',
        ],
      },
    ],
    addOns: [
      {
        id: 'pt_partner',
        label: 'Partner Training',
        description: 'Bring a training partner to every session',
        monthlyPrice: 75,
      },
      {
        id: 'pt_virtual',
        label: 'Virtual Sessions',
        description: 'Add 2 virtual training sessions per month',
        monthlyPrice: 50,
      },
    ],
  },
  {
    id: 'class_bundles',
    label: 'Class Bundles',
    icon: 'Users',
    description: 'Focused class packages for yoga, cycling, HIIT, and more.',
    tiers: [
      {
        id: 'class_explorer',
        label: 'Explorer (8 classes/mo)',
        monthlyPrice: 79,
        annualMonthlyPrice: 67,
        features: [
          '8 group classes per month (any type)',
          'Book up to 1 week in advance',
          'Includes Basic Gym Access',
          'Access to on-demand class library',
        ],
      },
      {
        id: 'class_enthusiast',
        label: 'Enthusiast (16 classes/mo)',
        monthlyPrice: 119,
        annualMonthlyPrice: 99,
        features: [
          '16 group classes per month (any type)',
          'Book up to 2 weeks in advance',
          'Priority waitlist placement',
          'Includes Basic Gym Access',
          '1 guest class pass per month',
        ],
      },
      {
        id: 'class_unlimited',
        label: 'Unlimited Classes',
        monthlyPrice: 159,
        annualMonthlyPrice: 135,
        features: [
          'Unlimited group classes',
          'Book up to 3 weeks in advance',
          'Top priority waitlist placement',
          'Includes Premium All-Access',
          '2 guest class passes per month',
          'Access to specialty workshops',
        ],
      },
    ],
    addOns: [
      {
        id: 'class_private',
        label: 'Private Group Session',
        description: 'Book a private class for up to 6 friends',
        monthlyPrice: 120,
      },
      {
        id: 'class_mat',
        label: 'Mat & Equipment Rental',
        description: 'Premium yoga mat + props provided every class',
        monthlyPrice: 15,
      },
    ],
  },
];
