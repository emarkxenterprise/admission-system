import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from './admin/layouts/ui/card';
import { Button } from './admin/layouts/ui/button';
import { Badge } from './admin/layouts/ui/badge';
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './admin/layouts/ui/alert-dialog';
import { useToast } from './admin/layouts/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import api from '../services/api';

const AdmissionOffers = () => {
    const [admissionOffers, setAdmissionOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchAdmissionOffers = useCallback(async () => {
        try {
            const response = await api.get('/admission-offers');
            setAdmissionOffers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching admission offers:', error);
            toast({
                title: "Error",
                description: "Failed to fetch admission offers",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAdmissionOffers();
    }, [fetchAdmissionOffers]);

    const handleAcceptOffer = async (offerId) => {
        setAccepting(true);
        try {
            await api.post(`/admission-offers/${offerId}/accept`);
            toast({
                title: "Success",
                description: "Admission offer accepted successfully!",
            });
            fetchAdmissionOffers();
        } catch (error) {
            console.error('Error accepting admission offer:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to accept admission offer",
                variant: "destructive",
            });
        } finally {
            setAccepting(false);
        }
    };

    const handleDeclineOffer = async (offerId) => {
        setDeclining(true);
        try {
            await api.post(`/admission-offers/${offerId}/decline`);
            toast({
                title: "Success",
                description: "Admission offer declined successfully",
            });
            fetchAdmissionOffers();
        } catch (error) {
            console.error('Error declining admission offer:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to decline admission offer",
                variant: "destructive",
            });
        } finally {
            setDeclining(false);
        }
    };

    const handlePaymentRedirect = (offer) => {
        // Redirect to payment page for acceptance fee
        window.location.href = `/payment/acceptance-fee/${offer.id}`;
    };

    const handleViewAdmissionLetter = (offerId) => {
        navigate(`/admission-letter/${offerId}`);
    };

    const getStatusBadge = (status, acceptanceFeePaid) => {
        // If acceptance fee is paid, show as accepted regardless of backend status
        if (acceptanceFeePaid) {
            return <Badge variant="default">Accepted</Badge>;
        }
        
        const statusConfig = {
            offered: { variant: "default", text: "Offered" },
            accepted: { variant: "default", text: "Accepted" },
            declined: { variant: "destructive", text: "Declined" },
            expired: { variant: "secondary", text: "Expired" }
        };
        
        const config = statusConfig[status] || { variant: "default", text: status };
        return <Badge variant={config.variant}>{config.text}</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    // Add a helper to get detailed status badges for user view
    const getDetailedStatusBadges = (offer) => {
        const badges = [];
        
        // Main status badge
        badges.push(
            <Badge key="main-status" variant="default" className="mr-1">
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
            </Badge>
        );
        
        // Acceptance fee status badge
        if (offer.acceptance_fee_paid) {
            badges.push(
                <Badge key="fee-paid" variant="default" className="mr-1">
                    Acceptance Fee Paid
                </Badge>
            );
        } else {
            badges.push(
                <Badge key="fee-unpaid" variant="secondary" className="mr-1">
                    Acceptance Fee Not Paid
                </Badge>
            );
        }
        
        // Admission acceptance status badge
        if (offer.admission_accepted || offer.acceptance_fee_paid) {
            badges.push(
                <Badge key="admission-accepted" variant="default" className="mr-1">
                    Admission Accepted
                </Badge>
            );
        } else {
            badges.push(
                <Badge key="admission-pending" variant="secondary" className="mr-1">
                    Not Yet Accepted
                </Badge>
            );
        }
        
        // Expired status badge
        if (offer.status === 'expired') {
            badges.push(
                <Badge key="expired" variant="destructive" className="mr-1">
                    Offer Expired
                </Badge>
            );
        }
        
        return badges;
    };

    const isOfferExpired = (deadline) => {
        return new Date(deadline) < new Date();
    };

    const canAcceptOffer = (offer) => {
        return offer.status === 'offered' && 
               offer.acceptance_fee_paid && 
               !isOfferExpired(offer.acceptance_deadline);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading admission offers...</p>
                </div>
            </div>
        );
    }

    if (admissionOffers.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="text-gray-500">
                        <h3 className="text-lg font-medium mb-2">No Admission Offers</h3>
                        <p>You don't have any admission offers at the moment.</p>
                        <p className="text-sm mt-1">Check back later or contact the admissions office.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Admission Offers</h1>
                <p className="text-gray-600">
                    Review and respond to your admission offers
                </p>
            </div>

            <div className="grid gap-6">
                {admissionOffers.map((offer) => (
                    <Card key={offer.id} className="border-2">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">
                                        {offer.department?.name} - {offer.admission_session?.name}
                                    </CardTitle>
                                    <p className="text-gray-600 mt-1">
                                        Application Number: {offer.application?.application_number}
                                    </p>
                                </div>
                                <div className="text-right">
                                    {getStatusBadge(offer.status, offer.acceptance_fee_paid)}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Offered: {formatDate(offer.offer_date)}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                            {/* Offer Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Program Details</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Department:</span> {offer.department?.name}</p>
                                        <p><span className="font-medium">Session:</span> {offer.admission_session?.name}</p>
                                        <p><span className="font-medium">Acceptance Fee:</span> {formatCurrency(offer.acceptance_fee_amount)}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium mb-2">Important Dates</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Offer Date:</span> {formatDate(offer.offer_date)}</p>
                                        <p><span className="font-medium">Deadline:</span> {formatDate(offer.acceptance_deadline)}</p>
                                        {offer.accepted_at && (
                                            <p><span className="font-medium">Accepted:</span> {formatDate(offer.accepted_at)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Acceptance Fee Payment</h4>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm">
                                            Status: 
                                            <Badge 
                                                variant={offer.acceptance_fee_paid ? "default" : "secondary"} 
                                                className="ml-2"
                                            >
                                                {offer.acceptance_fee_paid ? "Paid" : "Unpaid"}
                                            </Badge>
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Amount: {formatCurrency(offer.acceptance_fee_amount)}
                                        </p>
                                    </div>
                                    
                                    {!offer.acceptance_fee_paid && offer.status === 'offered' && (
                                        <Button 
                                            onClick={() => handlePaymentRedirect(offer)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            Pay Acceptance Fee
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Status Details */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Status Details</h4>
                                <div className="flex flex-wrap gap-1">
                                    {getDetailedStatusBadges(offer)}
                                </div>
                            </div>

                            {/* Admin Notes */}
                            {offer.admin_notes && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Admin Notes</h4>
                                    <p className="text-sm text-gray-700">{offer.admin_notes}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                {offer.status === 'offered' && (
                                    <>
                                        {canAcceptOffer(offer) ? (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        className="bg-green-600 hover:bg-green-700"
                                                        disabled={accepting}
                                                    >
                                                        {accepting ? 'Accepting...' : 'Accept Offer'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Accept Admission Offer</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to accept this admission offer? 
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => handleAcceptOffer(offer.id)}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            Accept Offer
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ) : (
                                            <div className="text-sm text-gray-600">
                                                {!offer.acceptance_fee_paid && "Please pay the acceptance fee first"}
                                                {isOfferExpired(offer.acceptance_deadline) && "This offer has expired"}
                                            </div>
                                        )}

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    disabled={declining}
                                                >
                                                    {declining ? 'Declining...' : 'Decline Offer'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Decline Admission Offer</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to decline this admission offer? 
                                                        This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => handleDeclineOffer(offer.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Decline Offer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}

                                {offer.status === 'accepted' || offer.acceptance_fee_paid ? (
                                    <div className="flex items-center gap-3">
                                        <div className="text-green-600 font-medium">
                                            ✓ Admission Accepted
                                        </div>
                                        {offer.acceptance_fee_paid && (
                                            <Button 
                                                onClick={() => handleViewAdmissionLetter(offer.id)}
                                                variant="outline"
                                                className="flex items-center gap-2"
                                            >
                                                <FileText className="w-4 h-4" />
                                                View Admission Letter
                                            </Button>
                                        )}
                                    </div>
                                ) : null}

                                {offer.status === 'declined' && (
                                    <div className="text-red-600 font-medium">
                                        ✗ Admission Declined
                                    </div>
                                )}

                                {offer.status === 'expired' && (
                                    <div className="text-gray-600 font-medium">
                                        ⏰ Offer Expired
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdmissionOffers; 