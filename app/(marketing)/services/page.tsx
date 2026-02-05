import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Users,
  Radio,
  DoorOpen,
  Search,
  Shirt,
  Settings,
  Crosshair,
} from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Body Guards",
    description:
      "Our team of skilled and knowledgeable security officers provides around-the-clock personal protection. Whether for executives, celebrities, or high-profile individuals, our bodyguards are trained in threat assessment, defensive tactics, and emergency response.",
    features: [
      "Armed and unarmed options",
      "Executive protection",
      "Event security",
      "Travel security",
    ],
  },
  {
    icon: Users,
    title: "Lady Checkers",
    description:
      "Professional female security staff for women-friendly screening at events, shopping malls, and corporate venues. Our lady checkers ensure respectful and thorough security checks while maintaining comfort and dignity.",
    features: [
      "Female-only screening",
      "Event entrance management",
      "Mall security",
      "Corporate venues",
    ],
  },
  {
    icon: Shield,
    title: "Insurance Coverage",
    description:
      "Comprehensive insurance coverage for all our security personnel and operations. We ensure that our clients are protected against any unforeseen circumstances during security operations.",
    features: [
      "Personnel coverage",
      "Liability protection",
      "Property damage coverage",
      "Incident response",
    ],
  },
  {
    icon: DoorOpen,
    title: "Walk Through Gates",
    description:
      "High-quality walk-through metal detection gates for enhanced security screening and access control. Designed for high-traffic areas, these gates enable quick, efficient, and non-intrusive scanning of individuals entering secured zones.",
    features: [
      "Advanced detection technology",
      "High throughput capacity",
      "Adjustable sensitivity",
      "Indoor and outdoor use",
    ],
  },
  {
    icon: Search,
    title: "Metal Detectors",
    description:
      "High-performance handheld metal detectors for precise and rapid detection of metallic objects. These user-friendly devices are ideal for security checkpoints, event entrances, and high-security premises.",
    features: [
      "Handheld and stationary",
      "High accuracy detection",
      "Quick scanning",
      "Battery operated",
    ],
  },
  {
    icon: Shirt,
    title: "Bullet Proof Vests",
    description:
      "High-quality bulletproof vests designed using advanced ballistic materials for maximum protection. Lightweight and comfortable, these vests allow mobility without compromising security standards.",
    features: [
      "Advanced ballistic protection",
      "Lightweight design",
      "Adjustable fit",
      "Extended wear comfort",
    ],
  },
  {
    icon: Settings,
    title: "Automatic Security Systems",
    description:
      "Advanced automatic security systems for effective asset management and protection. These intelligent systems utilize real-time monitoring, tracking, and access control technologies for comprehensive security.",
    features: [
      "Real-time monitoring",
      "Access control",
      "Alert notifications",
      "Remote management",
    ],
  },
  {
    icon: Radio,
    title: "Wireless Communication",
    description:
      "Top-notch wireless communication systems ensuring reliable, encrypted, and seamless communication among security personnel. With wide coverage and high-quality audio, these devices enhance coordination and response time.",
    features: [
      "Encrypted channels",
      "Wide coverage range",
      "Clear audio quality",
      "Durable construction",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary to-primary-800 text-white py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-lg text-gray-200">
              Comprehensive security solutions tailored to your unique needs.
              From professional guards to advanced security equipment, we provide
              complete protection for your business, events, and assets.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card
                key={service.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <Crosshair className="h-3 w-3 text-accent mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Need Custom Security Solutions?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our security experts can design a comprehensive protection plan
            tailored specifically to your requirements. Contact us for a free
            consultation.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90"
            >
              Get Free Quote
            </a>
            <a
              href="tel:03018689990"
              className="inline-flex items-center justify-center rounded-md border border-primary px-8 py-3 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Call: 03018689990
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
