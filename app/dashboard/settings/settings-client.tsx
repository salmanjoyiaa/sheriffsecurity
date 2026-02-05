"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Key,
  Loader2,
  Save,
  Upload,
  User,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import {
  CompanySettings,
  updateCompanySettings,
  uploadCompanyLogo,
  updateUserProfile,
  changePassword,
} from "./actions";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  branch_id: string | null;
  branch_name: string | null;
  created_at: string;
}

interface SettingsClientProps {
  companySettings: CompanySettings | null;
  userProfile: UserProfile;
  isSuperAdmin: boolean;
}

export default function SettingsClient({
  companySettings,
  userProfile,
  isSuperAdmin,
}: SettingsClientProps) {
  const { toast } = useToast();
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    companySettings?.logo_url || null
  );

  // Company settings form state
  const [companyName, setCompanyName] = useState(
    companySettings?.company_name || "Sheriff Security Company Pvt. Ltd"
  );
  const [tagline, setTagline] = useState(
    companySettings?.tagline || "The Name of Conservation"
  );
  const [address, setAddress] = useState(
    companySettings?.address ||
      "Mohalla Nawaban Main Street Jalwana Chock, Bahawalpur"
  );
  const [city, setCity] = useState(companySettings?.city || "Bahawalpur");
  const [phone, setPhone] = useState(companySettings?.phone || "03018689990");
  const [phoneSecondary, setPhoneSecondary] = useState(
    companySettings?.phone_secondary || "03336644631"
  );
  const [email, setEmail] = useState(
    companySettings?.email || "sheriffsgssc@gmail.com"
  );
  const [website, setWebsite] = useState(companySettings?.website || "");
  const [invoicePrefix, setInvoicePrefix] = useState(
    companySettings?.invoice_prefix || "INV"
  );
  const [invoiceFooter, setInvoiceFooter] = useState(
    companySettings?.invoice_footer || "Thank you for your business!"
  );
  const [taxRate, setTaxRate] = useState(companySettings?.tax_rate?.toString() || "0");

  // Profile form state
  const [fullName, setFullName] = useState(userProfile.full_name);

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingCompany(true);

    const formData = new FormData();
    if (companySettings?.id) {
      formData.append("id", companySettings.id);
    }
    formData.append("company_name", companyName);
    formData.append("tagline", tagline);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("phone", phone);
    formData.append("phone_secondary", phoneSecondary);
    formData.append("email", email);
    formData.append("website", website);
    formData.append("invoice_prefix", invoicePrefix);
    formData.append("invoice_footer", invoiceFooter);
    formData.append("tax_rate", taxRate);

    const result = await updateCompanySettings(formData);
    setIsSavingCompany(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Settings saved",
      description: "Company settings have been updated successfully.",
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingLogo(true);

    const formData = new FormData();
    formData.append("logo", file);

    const result = await uploadCompanyLogo(formData);
    setIsUploadingLogo(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      setLogoPreview(companySettings?.logo_url || null);
      return;
    }

    if (result.url) {
      setLogoPreview(result.url);
    }

    toast({
      title: "Logo uploaded",
      description: "Company logo has been updated successfully.",
    });
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append("full_name", fullName);

    const result = await updateUserProfile(formData);
    setIsSavingProfile(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingPassword(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const result = await changePassword(formData);
    setIsSavingPassword(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    form.reset();
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and company settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Security
          </TabsTrigger>
          {isSuperAdmin && (
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={userProfile.email} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <Button type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant={userProfile.role === "super_admin" ? "default" : "secondary"}>
                    {userProfile.role.replace("_", " ")}
                  </Badge>
                </div>
                {userProfile.branch_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="font-medium">{userProfile.branch_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {format(new Date(userProfile.created_at), "PPP")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" disabled={isSavingPassword}>
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab (Super Admin Only) */}
        {isSuperAdmin && (
          <TabsContent value="company">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company details used in reports and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveCompany} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone_secondary">Secondary Phone</Label>
                        <Input
                          id="phone_secondary"
                          value={phoneSecondary}
                          onChange={(e) => setPhoneSecondary(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    <Separator className="my-4" />

                    <h4 className="font-medium">Invoice Settings</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                        <Input
                          id="invoice_prefix"
                          value={invoicePrefix}
                          onChange={(e) => setInvoicePrefix(e.target.value)}
                          placeholder="INV"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                        <Input
                          id="tax_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice_footer">Invoice Footer</Label>
                      <Textarea
                        id="invoice_footer"
                        value={invoiceFooter}
                        onChange={(e) => setInvoiceFooter(e.target.value)}
                        rows={2}
                        placeholder="Thank you for your business!"
                      />
                    </div>

                    <Button type="submit" disabled={isSavingCompany}>
                      {isSavingCompany ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Logo</CardTitle>
                  <CardDescription>
                    Upload your company logo for reports and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                    {logoPreview ? (
                      <div className="relative w-48 h-48">
                        <Image
                          src={logoPreview}
                          alt="Company Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="mt-4">
                      <Label
                        htmlFor="logo-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        {isUploadingLogo ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </>
                        )}
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG, WebP, or SVG. Max 2MB.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
