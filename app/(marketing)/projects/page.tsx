import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";

const megaProjects = [
  {
    title: "Cholistan Jeep Rally",
    category: "Sports Event",
    description:
      "Sheriff Security provided comprehensive security coverage for the renowned Cholistan Jeep Rally, ensuring safety across the desert terrain. Our team managed crowd control, participant security, and event perimeter protection.",
    location: "Cholistan Desert, Punjab",
    highlights: [
      "Perimeter security",
      "VIP protection",
      "Crowd management",
      "Emergency response",
    ],
  },
  {
    title: "Karachi Eat Festival",
    category: "Food Festival",
    description:
      "Comprehensive security services for Pakistan's largest food festival. Our team managed entry screening, crowd control, and overall event security for thousands of daily visitors.",
    location: "Karachi, Sindh",
    highlights: [
      "Entry screening",
      "Walk-through gates",
      "Crowd control",
      "Night security",
    ],
  },
  {
    title: "Salana Ijtimaa",
    category: "Religious Gathering",
    description:
      "Large-scale security operations for the annual religious gathering. Sheriff Security ensured smooth operations with thousands of attendees, providing 24/7 security coverage.",
    location: "Multiple Locations",
    highlights: [
      "24/7 coverage",
      "Traffic management",
      "Emergency services",
      "Volunteer coordination",
    ],
  },
  {
    title: "Tent Pegging Spring Festival",
    category: "Cultural Event",
    description:
      "Security coverage for the traditional tent pegging competitions and spring festival celebrations. Our team managed spectator safety and participant security.",
    location: "Punjab Region",
    highlights: [
      "Arena security",
      "Spectator safety",
      "Participant protection",
      "Equipment security",
    ],
  },
  {
    title: "Dushman Drama - PTV",
    category: "Entertainment",
    description:
      "On-set security for Mont Blanc Entertainment's production. Sheriff Security provided location security, equipment protection, and crowd management during outdoor shoots.",
    location: "Various Locations",
    highlights: [
      "Location security",
      "Equipment protection",
      "Crowd barriers",
      "Celebrity protection",
    ],
  },
];

const clients = [
  {
    category: "Retail & Fashion",
    names: [
      "Khaadi",
      "Nishat Linen",
      "Borjan",
      "Limelight",
      "Outfitters",
      "MTJ - Tariq Jamil",
      "Junaid Jamshed",
      "Wasim Badami by Hemani",
    ],
  },
  {
    category: "Food & Restaurants",
    names: ["KFC", "McDonald's", "Nestlé", "Imtiaz Super Market"],
  },
  {
    category: "Automotive",
    names: ["KIA Motors"],
  },
  {
    category: "Shopping Malls",
    names: ["ACE Galleria", "Shamim Pacity", "Sultan Plaza"],
  },
  {
    category: "Heritage & Government",
    names: ["Noor Mahal", "Various Corporate Offices"],
  },
];

export default function ProjectsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary to-primary-800 text-white py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Mega Projects
            </h1>
            <p className="text-lg text-gray-200">
              Sheriff Security has successfully covered major events and provided
              comprehensive security services throughout various activities across
              Pakistan. Our team ensures safety and smooth execution at all times.
            </p>
          </div>
        </div>
      </section>

      {/* Mega Projects */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {megaProjects.map((project) => (
              <Card
                key={project.title}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-gradient-to-r from-primary to-primary-700 p-4">
                  <Badge className="bg-secondary text-secondary-foreground mb-2">
                    {project.category}
                  </Badge>
                  <h3 className="text-xl font-bold text-white">
                    {project.title}
                  </h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {project.location}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.highlights.map((highlight) => (
                      <Badge key={highlight} variant="outline">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Our Valued Clients
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            We are proud to provide security services to some of Pakistan&apos;s most
            renowned companies and organizations across various industries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clients.map((group) => (
              <Card key={group.category}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-primary mb-4">
                    {group.category}
                  </h3>
                  <ul className="space-y-2">
                    {group.names.map((name) => (
                      <li
                        key={name}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <Users className="h-3 w-3 text-accent mr-2" />
                        {name}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">50+</div>
              <div className="text-gray-200">Major Events</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">100+</div>
              <div className="text-gray-200">Active Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">500+</div>
              <div className="text-gray-200">Security Personnel</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">20+</div>
              <div className="text-gray-200">Years Experience</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
