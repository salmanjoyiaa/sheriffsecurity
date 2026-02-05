import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Building2 } from "lucide-react";

const branches = [
  {
    name: "Bahawalpur",
    type: "Head Office",
    address: "Mohalla Nawaban Main Street Jalwana Chock, Bahawalpur",
    phone: "03018689994, 03336644631",
    city: "Bahawalpur",
  },
  {
    name: "Multan",
    type: "Branch",
    address: "Office No.3, III Floor City Arcade Khanewal Road, Rasheed Abad, Multan",
    phone: "03018689990",
    city: "Multan",
  },
  {
    name: "Sahiwal",
    type: "Branch",
    address: "Royal Palm Garden G.T. Road, N-5 Bypass Chowk, Sahiwal, 57000",
    phone: "03018689990",
    city: "Sahiwal",
  },
  {
    name: "Sadiqabad",
    type: "Branch",
    address: "Manthar Rd, Allama Iqbal Town (Basti Mian Sahib), Sadiqabad",
    phone: "03018689990",
    city: "Sadiqabad",
  },
  {
    name: "Rahim Yar Khan",
    type: "Branch",
    address: "House No. R16 Rahim Garden Near Gulshan E Iqbal",
    phone: "03018689990",
    city: "Rahim Yar Khan",
  },
  {
    name: "Lahore",
    type: "Branch",
    address: "5-B, Commercial Talib Gunj Chowk Sher Shah Raiwind Road, Lahore",
    phone: "03018689990",
    city: "Lahore",
  },
  {
    name: "Lodhran",
    type: "Branch",
    address: "Super Chock, Bahawalpur Rd, B Colony, Lodhran",
    phone: "03018689990",
    city: "Lodhran",
  },
  {
    name: "Karachi",
    type: "Branch",
    address: "Shop No.4 Chiragh Square Mans Fiels Street, Sadder, Karachi",
    phone: "03018689990",
    city: "Karachi",
  },
  {
    name: "Bahawalnagar",
    type: "Branch",
    address: "Main Street Gaushala Chowk, Block 2, Bahawalnagar",
    phone: "03018689990",
    city: "Bahawalnagar",
  },
  {
    name: "Hasilpur",
    type: "Branch",
    address: "Waqas Road Near THQ Hospital, Tehsil Bazar",
    phone: "03018689990",
    city: "Hasilpur",
  },
];

export default function BranchesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary to-primary-800 text-white py-16">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Branches
            </h1>
            <p className="text-lg text-gray-200">
              Sheriff Security operates across Pakistan with multiple branch
              offices to serve you better. Find our nearest location and reach out
              for your security needs.
            </p>
          </div>
        </div>
      </section>

      {/* Head Office */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Head Office</h2>
          <Card className="max-w-2xl mx-auto border-2 border-primary">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Bahawalpur - Head Office
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Mohalla Nawaban Main Street Jalwana Chock, Bahawalpur, 63100
                  </p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <p className="text-gray-700">03018689994, 03336644631, 03018689990</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Branch Offices */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Branch Offices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches
              .filter((b) => b.type === "Branch")
              .map((branch) => (
                <Card
                  key={branch.name}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                      <Badge variant="secondary">{branch.city}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start text-sm">
                        <MapPin className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600">{branch.address}</p>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <a
                          href={`tel:${branch.phone.split(",")[0].trim()}`}
                          className="text-primary hover:underline"
                        >
                          {branch.phone}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Coverage Map Placeholder */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Nationwide Coverage</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            With branches across Punjab and Sindh, Sheriff Security provides
            comprehensive security services throughout Pakistan. No matter where
            you are, we&apos;ve got you covered.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
            {[
              "Bahawalpur",
              "Multan",
              "Lahore",
              "Karachi",
              "Sahiwal",
              "Sadiqabad",
              "Rahim Yar Khan",
              "Lodhran",
              "Bahawalnagar",
              "Hasilpur",
            ].map((city) => (
              <div
                key={city}
                className="bg-primary/5 rounded-lg p-3 text-center"
              >
                <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
                <span className="text-sm font-medium">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
