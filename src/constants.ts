/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DogCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  tasks: string[];
  imageUrl: string;
}

export interface TimelineEvent {
  year: string;
  title?: string;
  description: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  isFeatured?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const DOG_CATEGORIES: DogCategory[] = [
  {
    id: 'guide',
    name: 'Guide Dogs',
    description: 'Assist individuals who are blind or visually impaired. Must be capable of intelligent disobedience.',
    icon: 'Eye',
    tasks: ['Safe navigation', 'Finding doors & chairs'],
    imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'service',
    name: 'Service Dogs',
    description: 'Assist individuals with physical disabilities to increase independence and reduce reliance.',
    icon: 'Accessibility',
    tasks: ['Retrieving items', 'Opening doors & drawers'],
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'hearing',
    name: 'Hearing Dogs',
    description: 'Alert deaf or hard-of-hearing individuals to important sounds they would otherwise miss.',
    icon: 'Ear',
    tasks: ['Fire & smoke alarms', 'Doorbells & knocking'],
    imageUrl: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'seizure',
    name: 'Seizure Alert Dogs',
    description: 'Trained to recognize pre-seizure indicators and alert handlers before an event occurs.',
    icon: 'Zap',
    tasks: ['Pre-seizure alerting', 'Summoning assistance'],
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'psychiatric',
    name: 'Psychiatric Service',
    description: 'Assist individuals with mental health conditions by performing specific mitigating tasks.',
    icon: 'Brain',
    tasks: ['Interrupting panic attacks', 'Grounding & safety'],
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'medical',
    name: 'Medical Alert Dogs',
    description: 'Detect changes in handler\'s body chemistry and warn of potential medical emergencies.',
    icon: 'Activity',
    tasks: ['Low/high blood sugar', 'Allergen detection'],
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800'
  }
];

export const HISTORY: TimelineEvent[] = [
  { year: '1991', description: 'ADI founded with 5 visionary member organizations.' },
  { year: '1995', description: 'Launched formal accreditation program, the first of its kind.' },
  { year: '2015', description: 'Launched online certification verification system for global use.' },
  { year: '2024', description: 'Surpassing 300 member programs serving thousands globally.' }
];

export const STEPS: Step[] = [
  { number: 1, title: 'Apply Online', description: 'Complete our simple online application with your service animal\'s details and training documentation.' },
  { number: 2, title: 'Verification', description: 'Our expert team verifies your application through official ADI-member databases and training facility audits.', isFeatured: true },
  { number: 3, title: 'Get Certified', description: 'Receive your official ADI certification, digital credentials, and microchip registration package.' }
];

export const FAQ: FaqItem[] = [
  {
    question: 'What is Assistance Dogs International (ADI)?',
    answer: 'ADI is a worldwide coalition of nonprofit programs that train and place assistance dogs. Founded in 1991, ADI promotes the highest standards for training, behavior, welfare, and ethics. ADI provides accreditation to qualifying organizations and serves as an informational resource.'
  },
  {
    question: 'What types of dogs does ADI certify?',
    answer: 'ADI certifies Guide Dogs, Service Dogs, Hearing Dogs, Seizure Alert Dogs, Psychiatric Service Dogs, and Medical Alert Dogs. All must meet ADI\'s rigorous training and welfare standards.'
  },
  {
    question: 'How do I verify a service animal certificate?',
    answer: 'Enter the microchip number on our verification page. If registered with an ADI-accredited program, you\'ll see complete certification details including training facility, handler, and certification date.'
  },
  {
    question: 'What are the ADI training standards?',
    answer: 'ADI requires minimum 120 hours of training over at least 6 months, including public access training, specific task training, health testing, temperament evaluations, and behavioral standards in various public settings.'
  }
];
