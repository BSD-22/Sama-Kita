import Page from "@/app/dashboard/page";

export default function DashboardPage() {
  return (
    <Page>
      <div className="flex flex-col justify-center items-center h-max my-auto">
        <h1 className="text-3xl font-bold text-center">Welcome to Sama Kita Dashboard!</h1>
        <p className="text-lg text-muted-foreground text-center mt-2">Explore your properties, see your data in real time, and automatic system management is in place.</p>
      </div>
    </Page>
  );
}
