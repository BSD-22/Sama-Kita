import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, Calendar } from "lucide-react";
import { Link } from "react-router";
import { format } from "date-fns";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { fetchRenters } from "@/store/renters";

interface Renter {
  id: number;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  joinDate: string;
  hasLeaved: boolean;
  propertyId: number;
  individualRoom?: { roomNumber: string };
  property?: { propertyName: string };
}

export default function RentersPage() {
  const dispatch = useAppDispatch();
  const { renters, isLoading } = useAppSelector((state) => state.renters);

  useEffect(() => {
    dispatch(fetchRenters());
  }, [dispatch]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-36 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded-md animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="pt-2 border-t space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="h-4 w-1/3 bg-gray-200 rounded-md animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Renters</h1>
        <Link to="/renters/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Renter
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renters.map((renter: Renter) => (
          <Card key={renter.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{renter.renterName}</CardTitle>
                <Badge variant={renter.hasLeaved ? "destructive" : "secondary"}>{renter.hasLeaved ? "Left" : "Active"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="w-4 h-4 mr-2" />
                    {renter.renterPhone}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="w-4 h-4 mr-2" />
                    {renter.renterEmail}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined: {format(new Date(renter.joinDate), "PP")}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500">Room: {renter.individualRoom?.roomNumber}</p>
                  <p className="text-sm text-gray-500">Property: {renter.property?.propertyName}</p>
                </div>

                <Link to={`/renters/${renter.id}`}>
                  <Button
                    variant="outline"
                    className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
