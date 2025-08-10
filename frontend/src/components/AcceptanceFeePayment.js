import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from './admin/layouts/ui/card';
import { Button } from './admin/layouts/ui/button';

import { useToast } from './admin/layouts/ui/use-toast';
import api from '../services/api';

const AcceptanceFeePayment = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const { toast } = useToast();

      const fetchOfferDetails = useCallback(async () => {
        try {
            const response = await api.get(`/admission-offers/${offerId}`);
            setOffer(response.data.data);
        } catch (error) {
            console.error('Error fetching offer details:', error);
            toast({
                title: "Error",
                description: "Failed to fetch offer details",
                variant: "destructive",
            });
            navigate('/admission-offers');
              } finally {
          setLoading(false);
      }
  }, [offerId, toast, navigate]);

  useEffect(() => {
      fetchOfferDetails();
  }, [fetchOfferDetails]);

    const initializePayment = async () => {
        setPaymentLoading(true);
        try {
            const response = await api.post('/payments/initialize', {
                amount: offer.acceptance_fee_amount,
                type: 'acceptance_fee',
                admission_id: offer.id,
                application_id: offer.application_id,
                description: `Acceptance Fee - ${offer.department?.name} (${offer.admission_session?.name})`
            });

            const { authorization_url, reference } = response.data.data;
            
            // Store reference in localStorage for verification
            localStorage.setItem('payment_reference', reference);
            localStorage.setItem('payment_type', 'acceptance_fee');
            localStorage.setItem('admission_id', offer.id);

            // Redirect to Paystack
            window.location.href = authorization_url;
        } catch (error) {
            console.error('Error initializing payment:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to initialize payment",
                variant: "destructive",
            });
        } finally {
            setPaymentLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading offer details...</p>
                </div>
            </div>
        );
    }

    if (!offer) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="text-gray-500">
                        <h3 className="text-lg font-medium mb-2">Offer Not Found</h3>
                        <p>The admission offer you're looking for doesn't exist.</p>
                        <Button 
                            onClick={() => navigate('/admission-offers')}
                            className="mt-4"
                        >
                            Back to Offers
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (offer.acceptance_fee_paid) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="text-green-600">
                        <h3 className="text-lg font-medium mb-2">Payment Already Completed</h3>
                        <p>You have already paid the acceptance fee for this offer.</p>
                        <div className="flex gap-3 mt-4 justify-center">
                            <Button 
                                onClick={() => navigate(`/admission-letter/${offer.id}`)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                View Admission Letter
                            </Button>
                            <Button 
                                onClick={() => navigate('/admission-offers')}
                                variant="outline"
                            >
                                View Offers
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (offer.status !== 'offered') {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="text-gray-500">
                        <h3 className="text-lg font-medium mb-2">Offer Not Available</h3>
                        <p>This offer is not available for payment.</p>
                        <Button 
                            onClick={() => navigate('/admission-offers')}
                            className="mt-4"
                        >
                            Back to Offers
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Acceptance Fee Payment</h1>
                <p className="text-gray-600">
                    Complete your admission by paying the acceptance fee
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Offer Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Admission Offer Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><span className="font-medium">Department:</span> {offer.department?.name}</p>
                                <p><span className="font-medium">Session:</span> {offer.admission_session?.name}</p>
                                <p><span className="font-medium">Application #:</span> {offer.application?.application_number}</p>
                            </div>
                            <div>
                                <p><span className="font-medium">Offer Date:</span> {formatDate(offer.offer_date)}</p>
                                <p><span className="font-medium">Deadline:</span> {formatDate(offer.acceptance_deadline)}</p>
                                <p><span className="font-medium">Student:</span> {offer.application?.full_name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Amount */}
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            {formatCurrency(offer.acceptance_fee_amount)}
                        </div>
                        <p className="text-gray-600">Acceptance Fee Amount</p>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h3 className="font-medium mb-3">Payment Method</h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-8 bg-white rounded border flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">PS</span>
                                </div>
                                <div>
                                    <p className="font-medium">Paystack</p>
                                    <p className="text-sm text-gray-600">
                                        Secure payment via card, bank transfer, or USSD
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 text-yellow-800">Important Information</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Payment is required to accept your admission offer</li>
                            <li>• Payment deadline: {formatDate(offer.acceptance_deadline)}</li>
                            <li>• You will be redirected to Paystack for secure payment</li>
                            <li>• After successful payment, you can accept your admission</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button 
                            onClick={initializePayment}
                            disabled={paymentLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            {paymentLoading ? 'Processing...' : 'Pay Now'}
                        </Button>
                        
                        <Button 
                            variant="outline"
                            onClick={() => navigate('/admission-offers')}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AcceptanceFeePayment; 