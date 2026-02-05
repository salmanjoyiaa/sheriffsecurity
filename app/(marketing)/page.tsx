import Link from "next/link";
import {
  Shield,
  Phone,
  CheckCircle2,
  Users,
  Building2,
  Award,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Years of Experience", value: "20+", icon: Award },
  { label: "Security Personnel", value: "500+", icon: Users },
  { label: "Active Clients", value: "100+", icon: Building2 },
  { label: "Branches Nationwide", value: "9", icon: Shield },
];

const services = [
  {
    title: "Body Guards",
    description:
      "Professional armed and unarmed security personnel for personal protection.",
  },
  {
    title: "Lady Checkers",
    description:
      "Female security staff for women-friendly screening at events and venues.",
  },
  {
    title: "Walk Through Gates",
    description:
      "Advanced detection technology for high-traffic security screening.",
  },
  {
    title: "Metal Detectors",
    description:
      "Handheld and stationary detectors for precise threat detection.",
  },
  {
    title: "Bullet Proof Vests",
    description:
      "High-quality protective gear for security personnel in high-risk environments.",
  },
  {
    title: "Security Systems",
    description:
      "Automated monitoring and access control for comprehensive protection.",
  },
];

const clients = [
  "Khaadi",
  "Nishat Linen",
  "Borjan",
  "KIA",
  "Limelight",
  "Outfitters",
  "MTJ - Tariq Jamil",
  "Junaid Jamshed",
  "KFC",
  "McDonald's",
  "Nestlé",
  "Imtiaz",
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-secondary/20 px-4 py-1.5 text-sm font-medium text-secondary mb-6">
              <Shield className="mr-2 h-4 w-4" />
              Since 2004 - Trusted Security Partner
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Sheriff Security
              <span className="block text-secondary">
                The Name of Conservation
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
              Professional security services trusted by leading brands across
              Pakistan. From bodyguards to advanced security systems, we provide
              comprehensive protection for your business and events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  Get a Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:03018689990">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  03018689990
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive security solutions tailored to your unique needs.
              Our team of skilled professionals is ready around-the-clock.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <CheckCircle2 className="h-8 w-8 text-accent mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <Button variant="outline" size="lg">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted By Leading Brands
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We are proud to provide security services to some of Pakistan&apos;s
              most renowned companies and organizations.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {clients.map((client) => (
              <div
                key={client}
                className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="font-medium text-gray-700">{client}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Secure Your Business?
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation. Our security experts will
            assess your needs and provide a customized solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="tel:03018689990">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
