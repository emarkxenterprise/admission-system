import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from './admin/layouts/ui/card';
import { Button } from './admin/layouts/ui/button';
import { Badge } from './admin/layouts/ui/badge';
import { useToast } from './admin/layouts/ui/use-toast';
import { Download, Printer, Share2, Calendar, Building, GraduationCap, User, FileText } from 'lucide-react';
import api from '../services/api';

// Add print styles
const printStyles = `
  @media print {
    /* Hide navigation elements only */
    nav, .navbar, .sidebar, header, .header-actions, .status-badge,
    div[class*="fixed"], div[class*="z-50"], div[class*="z-40"] {
      display: none !important;
    }
    
    /* Hide header actions and status badge */
    .print\\:hidden, .header-actions, .status-badge {
      display: none !important;
    }
    
    /* Reset body styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      line-height: 1.2 !important;
    }
    
    /* Reset all elements to remove any default spacing */
    * {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    
    /* Ensure the first element starts at the very top */
    body > *:first-child {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    
    /* Ensure content is visible and properly positioned */
    .max-w-4xl {
      padding: 0 !important;
      margin: 0 !important;
      max-width: none !important;
      display: block !important;
      visibility: visible !important;
    }
    
    .letter-title {
        font-size: 1.25rem !important;
        font-weight: bold !important;
        color: #111827 !important;
        margin-bottom: 1rem !important;
        text-align: center !important;
    }
                        


    /* Style the admission letter content */
    .admission-letter-content {
      padding-left: 5px !important;
      margin: 0 !important;
      padding-top: 0 !important;
      max-width: none !important;
      width: 100% !important;
      display: block !important;
      visibility: visible !important;
      text-align: justify !important;
      position: relative !important;
      top: 0 !important;
    }
    
    /* Ensure the card is visible */
    .admission-letter-card {
      box-shadow: none !important;
      border: none !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
      visibility: visible !important;
    }
    
    /* Maintain the blue border line */
    .blue-border-print {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      bottom: 0 !important;
      width: 8px !important;
      border-left: 8px solid #1e40af !important;
      z-index: 1 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Logo Watermark Background */
    .watermark-print {
      position: absolute !important;
      inset: 0 !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
      background-size: 500px 500px !important;
      opacity: 0.12 !important;
      pointer-events: none !important;
      z-index: 0 !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      display: block !important;
      visibility: visible !important;
    }
    
    /* Ensure all images are visible in print */
    img {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      max-width: none !important;
      max-height: none !important;
    }
    
    /* Specific styles for candidate photo */
    img[alt="Candidate Photo"], .candidate-photo {
      width: 96px !important;
      height: 128px !important;
      object-fit: cover !important;
      border: 2px solid #d1d5db !important;
      border-radius: 4px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* Candidate photo container */
    .candidate-photo-container {
      display: block !important;
      visibility: visible !important;
      position: relative !important;
      margin-left: 1rem !important;
    }
    
    /* Candidate watermark */
    .candidate-watermark {
      position: absolute !important;
      inset: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background-color: rgba(0, 0, 0, 0.3) !important;
      border-radius: 4px !important;
      visibility: visible !important;
    }
    
    .candidate-watermark span {
      color: white !important;
      font-size: 10px !important;
      font-weight: 600 !important;
      text-align: center !important;
      padding: 0 2px !important;
      line-height: 1.2 !important;
      visibility: visible !important;
    }
    .blue-border-line-print:nth-child(1) {
      left: 5px !important;
    }
    .blue-border-line-print:nth-child(2) {
      left: 20px !important;
    }
    
    /* Ensure border lines are not hidden by any print styles */
    .blue-border-print,
    .blue-border-line-print {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Ensure content doesn't overlap with border */
    .admission-letter-content > * {
      position: relative !important;
      z-index: 3 !important;
    }
    
    /* Force grid layout for admission details */
    .grid {
      display: grid !important;
    }
    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    .md\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    
    /* Ensure proper page breaks */
    .admission-letter-content {
      page-break-inside: avoid;
      page-break-before: auto;
      page-break-after: auto;
    }
    
    /* Force content to start at the top of the page */
    body {
      page-break-before: auto;
      page-break-after: auto;
    }
    
    /* Ensure the main container starts at the top */
    .max-w-4xl {
      page-break-before: auto;
      page-break-after: auto;
    }
    
    /* Ensure text is readable */
    * {
      color: black !important;
      background: white !important;
    }
    
    /* Make content more compact to fit on one page */
    .text-2xl {
      font-size: 1.25rem !important;
      line-height: 1.5rem !important;
    }
    
    .text-xl {
      font-size: 1.125rem !important;
      line-height: 1.5rem !important;
    }
    
    .text-lg {
      font-size: 1rem !important;
      line-height: 1.25rem !important;
    }
    
    .mb-8 {
      margin-bottom: 0.5rem !important;
    }
    
    .mt-12 {
      margin-top: 0 !important;
    }
    
    .p-8 {
      padding: 0.5rem !important;
    }
    
    /* Maintain spacing and layout */
    .space-y-6 > * + * {
      margin-top: 1rem !important;
    }
    .space-y-4 > * + * {
      margin-top: 0.75rem !important;
    }
    .gap-4 {
      gap: 0.75rem !important;
    }
    
    /* Force specific grid layout for admission details section */
    .bg-gray-50 .grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 1rem !important;
    }
    
    /* Ensure icons and content in grid items are properly aligned */
    .flex.items-center.gap-3 {
      display: flex !important;
      align-items: center !important;
      gap: 0.75rem !important;
    }
  }
`;

const AdmissionLetter = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [admission, setAdmission] = useState(null);
    const [schoolSettings, setSchoolSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchSchoolSettings = useCallback(async () => {
        try {
            const response = await api.get('/settings');
            const settings = response.data.data || response.data;
            console.log('School settings fetched:', settings);
            setSchoolSettings(settings);
        } catch (error) {
            console.error('Error fetching school settings:', error);
            // Don't show error toast for school settings as it's not critical
            // Just use default values if settings fail to load
        }
    }, []);

    const fetchAdmissionDetails = useCallback(async () => {
        try {
            const response = await api.get(`/admission-offers/${offerId}`);
            const offerData = response.data.data;
            
            if (!offerData.acceptance_fee_paid) {
                toast({
                    title: "Access Denied",
                    description: "You must pay the acceptance fee to view your admission letter",
                    variant: "destructive",
                });
                navigate('/admission-offers');
                return;
            }
            
            console.log('Admission data fetched:', offerData);
            setAdmission(offerData);
        } catch (error) {
            console.error('Error fetching admission details:', error);
            toast({
                title: "Error",
                description: "Failed to fetch admission details",
                variant: "destructive",
            });
            navigate('/admission-offers');
        } finally {
            setLoading(false);
        }
    }, [offerId, toast, navigate]);

    useEffect(() => {
        fetchAdmissionDetails();
        fetchSchoolSettings();
        
        // Inject print styles
        const styleElement = document.createElement('style');
        styleElement.textContent = printStyles;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, [fetchAdmissionDetails, fetchSchoolSettings]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Admission Letter - ${admission.application?.full_name || admission.application?.first_name + ' ' + admission.application?.last_name || admission.full_name || 'Student'}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 0; 
                            line-height: 1.6; 
                            background-color: white;
                        }
                        .letter-content { 
                            margin: 0; 
                            position: relative; 
                            padding: 2rem 2rem 2rem 3rem; 
                            max-width: 800px;
                            margin: 0 auto;
                            background: white;
                        }
                        .blue-border { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            bottom: 0; 
                            width: 8px; 
                            border-left: 8px solid #1e40af;
                            z-index: 1; 
                        }
                        
                        .watermark-print {
                            position: absolute;
                            inset: 0;
                            background-position: center;
                            background-repeat: no-repeat;
                            background-size: 500px 500px;
                            opacity: 0.08;
                            pointer-events: none;
                            z-index: 0;
                        }

                        .letter-content > * { position: relative; z-index: 3; }
                        
                        /* University Header Styles */
                        .university-header {
                            text-align: center;
                            margin-bottom: 2rem;
                        }
                        .logo-section {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 1rem;
                        }
                        .logo-circle {
                            width: 64px;
                            height: 64px;
                            background-color: #2563eb;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-right: 1rem;
                        }
                        .university-info {
                            text-align: left;
                        }
                        .university-name {
                            font-size: 1.5rem;
                            font-weight: bold;
                            color: #111827;
                            margin-bottom: 0.25rem;
                        }
                        .university-tagline {
                            color: #6b7280;
                            font-style: italic;
                            font-size: 0.875rem;
                        }
                        .university-details {
                            font-size: 0.875rem;
                            color: #6b7280;
                        }
                        
                        /* Letter Content Styles */
                        .letter-body {
                            margin-top: 1.5rem;
                        }
                        .date-section {
                            margin-bottom: 1rem;
                        }
                        .date-text {
                            color: #6b7280;
                            margin-bottom: 0.5rem;
                        }
                        .ref-text {
                            color: #6b7280;
                            margin-bottom: 1rem;
                        }
                        .recipient-section {
                            margin-bottom: 1.5rem;
                        }
                        .recipient-name {
                            font-weight: 500;
                            color: #111827;
                            margin-bottom: 0.5rem;
                        }
                        .recipient-address {
                            color: #6b7280;
                        }
                        .letter-title {
                            font-size: 1.25rem;
                            font-weight: bold;
                            color: #111827;
                            margin-bottom: 1rem;
                            text-align: center;
                        }
                        
                        /* Ensure title is centered in print */
                        @media print {
                            .letter-title {
                                text-align: center !important;
                            }
                        }
                        .letter-paragraph {
                            color: #374151;
                            line-height: 1.6;
                            margin-bottom: 1rem;
                        }
                        .highlight {
                            font-weight: 500;
                        }
                        
                        /* Admission Details Section */
                        .admission-details {
                            background-color: #f9fafb;
                            padding: 1.5rem;
                            border-radius: 0.5rem;
                            margin: 1.5rem 0;
                        }
                        .details-title {
                            font-weight: bold;
                            color: #111827;
                            margin-bottom: 1rem;
                        }
                        .details-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 1rem;
                        }
                        .detail-item {
                            display: flex;
                            align-items: center;
                            gap: 0.75rem;
                        }
                        .detail-icon {
                            width: 20px;
                            height: 20px;
                            color: #2563eb;
                        }
                        .detail-label {
                            font-size: 0.875rem;
                            color: #6b7280;
                        }
                        .detail-value {
                            font-weight: 500;
                            color: #111827;
                        }
                        
                        /* Force grid layout for admission details */
                        .grid {
                            display: grid !important;
                        }
                        .grid-cols-1 {
                            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
                        }
                        .md\\:grid-cols-2 {
                            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        }
                        
                        /* Force specific grid layout for admission details section */
                        .bg-gray-50 .grid {
                            display: grid !important;
                            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                            gap: 1rem !important;
                        }
                        
                        /* Maintain spacing */
                        .space-y-6 > * + * {
                            margin-top: 1.5rem;
                        }
                        .space-y-4 > * + * {
                            margin-top: 1rem;
                        }
                        .gap-4 {
                            gap: 1rem;
                        }
                        
                        /* Ensure icons and content in grid items are properly aligned */
                        .flex.items-center.gap-3 {
                            display: flex !important;
                            align-items: center !important;
                            gap: 0.75rem !important;
                        }
                        
                        @media print { 
                            body { margin: 0 !important; padding: 2px !important; }  
                            .blue-border { 
                                display: block !important; 
                                visibility: visible !important; 
                                border-left: 8px solid #1e40af !important;
                                opacity: 1 !important;
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                                box-shadow: none !important;
                            }
                            .watermark-print {
                                visibility: visible !important;
                                opacity: 0.12 !important;
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                                display: block !important;
                                position: absolute !important;
                                inset: 0 !important;
                                background-position: center !important;
                                background-repeat: no-repeat !important;
                                background-size: 500px 500px !important;
                                pointer-events: none !important;
                                z-index: 0 !important;
                            }
                            .letter-content { 
                                padding-left: 5px !important; 
                                text-align: justify !important; 
                            }
                            
                            /* Make content more compact */
                            .text-2xl { font-size: 1.25rem !important; line-height: 1.5rem !important; }
                            .text-xl { font-size: 1.125rem !important; line-height: 1.5rem !important; }
                            .text-lg { font-size: 1rem !important; line-height: 1.25rem !important; }
                            .mb-8 { margin-bottom: 1rem !important; }
                            .mt-12 { margin-top: 1.5rem !important; }
                            .p-8 { padding: 1rem !important; }
                            
                            /* Ensure candidate photo displays in print */
                            .date-section { 
                                display: flex !important; 
                                justify-content: space-between !important; 
                                align-items: flex-start !important; 
                            }
                            .date-section img {
                                width: 96px !important;
                                height: 128px !important;
                                object-fit: cover !important;
                                border: 2px solid #d1d5db !important;
                                border-radius: 4px !important;
                                margin-left: 1rem !important;
                            }
                            .date-section .relative {
                                position: relative !important;
                            }
                            .date-section .relative > div:last-child {
                                position: absolute !important;
                                inset: 0 !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                background-color: rgba(0, 0, 0, 0.3) !important;
                                border-radius: 4px !important;
                            }
                            .date-section .relative > div:last-child span {
                                color: white !important;
                                font-size: 10px !important;
                                font-weight: 600 !important;
                                text-align: center !important;
                                padding: 0 2px !important;
                                line-height: 1.2 !important;
                            }
                            
                            /* Ensure candidate photo displays in main component print */
                            .flex.justify-between.items-start {
                                display: flex !important;
                                justify-content: space-between !important;
                                align-items: flex-start !important;
                            }
                            .flex.justify-between.items-start img {
                                width: 96px !important;
                                height: 128px !important;
                                object-fit: cover !important;
                                border: 2px solid #d1d5db !important;
                                border-radius: 4px !important;
                                margin-left: 1rem !important;
                                display: block !important;
                                visibility: visible !important;
                            }
                            .flex.justify-between.items-start .relative {
                                position: relative !important;
                                display: block !important;
                                visibility: visible !important;
                            }
                            .flex.justify-between.items-start .relative > div:last-child {
                                position: absolute !important;
                                inset: 0 !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                background-color: rgba(0, 0, 0, 0.3) !important;
                                border-radius: 4px !important;
                                visibility: visible !important;
                            }
                            .flex.justify-between.items-start .relative > div:last-child span {
                                color: white !important;
                                font-size: 10px !important;
                                font-weight: 600 !important;
                                text-align: center !important;
                                padding: 0 2px !important;
                                line-height: 1.2 !important;
                                visibility: visible !important;
                            }
                            
                            /* Additional print fixes for images */
                            * {
                                -webkit-print-color-adjust: exact !important;
                                color-adjust: exact !important;
                            }
                            
                            /* Force all candidate images to be visible */
                            img:not([src=""]):not([src*="undefined"]) {
                                display: block !important;
                                visibility: visible !important;
                                opacity: 1 !important;
                            }
                            
                            /* Print-specific container fixes */
                            .candidate-photo-container,
                            .ml-4.relative {
                                display: block !important;
                                visibility: visible !important;
                                position: relative !important;
                                margin-left: 1rem !important;
                                float: right !important;
                                clear: both !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="letter-content">
                        <div class="blue-border"></div>
                        
                        <!-- Logo Watermark Background -->
                        <div class="watermark-print" style="position: absolute; inset: 0; background-image: url('${schoolSettings?.print_logo ? `http://localhost:8000/storage/${schoolSettings.print_logo}` : `data:image/svg+xml,%3Csvg width=&quot;200&quot; height=&quot;200&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Crect width=&quot;16&quot; height=&quot;20&quot; x=&quot;4&quot; y=&quot;2&quot; rx=&quot;2&quot; ry=&quot;2&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M9 22v-4h6v4&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M8 6h.01&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M16 6h.01&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M12 6h.01&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M12 10h.01&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M12 14h.01&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M16 10h.01&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M16 14h.01&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M8 10h.01&quot; fill=&quot;%232563eb&quot;/%3E%3Cpath d=&quot;M8 14h.01&quot; fill=&quot;%232563eb&quot;/%3E%3C/svg%3E`}'); background-position: center; background-repeat: no-repeat; background-size: 500px 500px; opacity: 0.12; pointer-events: none; z-index: 0;"></div>
                        
                        <!-- University Header -->
                        <div class="university-header">
                            <div class="logo-section">
                                ${schoolSettings?.print_logo ? 
                                    `<div class="logo-circle">
                                        <img src="http://localhost:8000/storage/${schoolSettings.print_logo}" alt="School Logo" style="width: 32px; height: 32px; object-fit: contain;">
                                    </div>` 
                                    : 
                                    `<div class="logo-circle">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                                            <path d="M9 22v-4h6v4"/>
                                            <path d="M8 6h.01"/>
                                            <path d="M16 6h.01"/>
                                            <path d="M12 6h.01"/>
                                            <path d="M12 10h.01"/>
                                            <path d="M12 14h.01"/>
                                            <path d="M16 10h.01"/>
                                            <path d="M16 14h.01"/>
                                            <path d="M8 10h.01"/>
                                            <path d="M8 14h.01"/>
                                        </svg>
                                    </div>`
                                }
                                <div class="university-info">
                                    <div class="university-name">${schoolSettings?.school_name || 'UNIVERSITY NAME'}</div>
                                    <div class="university-tagline">"${schoolSettings?.school_motto || 'Excellence in Education'}"</div>
                                </div>
                            </div>
                            <div class="university-details">
                                <p>${schoolSettings?.school_address || 'University Address, City, State'}</p>
                                <p>Phone: ${schoolSettings?.school_phone || '+234 XXX XXX XXXX'} | Email: ${schoolSettings?.school_email || 'info@university.edu.ng'}</p>
                            </div>
                        </div>

                        <!-- Letter Content -->
                        <div class="letter-body">
                            <div class="date-section" style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <p class="date-text">Date: ${formatDate(new Date())}</p>
                                    <p class="ref-text" style="margin-bottom: 0.5rem; font-weight: bold;"><strong>Ref: ADM/${admission.admission_session?.name}/${admission.application?.application_number}</strong></p>
                                    <h4 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin-bottom: 0.5rem;">Candidate: ${admission.application?.full_name || admission.application?.first_name + ' ' + admission.application?.last_name || admission.full_name || 'N/A'}</h4>
                                    <p class="recipient-address">${admission.application?.address || 'Student Address'}</p>
                                </div>
                                ${admission.application?.passport ? 
                                    `<div style="margin-left: 1rem; position: relative;">
                                        <img src="http://localhost:8000/storage/${admission.application.passport}" alt="Candidate Photo" style="width: 96px; height: 128px; object-fit: cover; border: 2px solid #d1d5db; border-radius: 4px;">
                                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.3); border-radius: 4px;">
                                            <span style="color: white; font-size: 10px; font-weight: 600; text-align: center; padding: 0 2px; line-height: 1.2;">${admission.application?.application_number}</span>
                                        </div>
                                    </div>` 
                                    : ''
                                }
                            </div>

                            <div class="letter-title">ADMISSION LETTER</div>
                            
                            <p class="letter-paragraph">
                                Dear <span class="highlight">${admission.application?.full_name || admission.application?.first_name + ' ' + admission.application?.last_name || admission.full_name || 'Student'}</span>,
                            </p>

                            <p class="letter-paragraph">
                                We are pleased to inform you that your application for admission into the 
                                <span class="highlight">${admission.department?.name}</span>
                                program for the <span class="highlight">${admission.admission_session?.name}</span> 
                                academic session has been successful.
                            </p>

                            <p class="letter-paragraph">
                                This letter serves as official confirmation of your admission to our prestigious institution. 
                                We congratulate you on this achievement and welcome you to our academic community.
                            </p>

                            <!-- Admission Details -->
                            <div class="admission-details">
                                <div class="details-title">Admission Details</div>
                                <div class="details-grid">
                                    <div class="detail-item">
                                        <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                        </svg>
                                        <div>
                                            <div class="detail-label">Program</div>
                                            <div class="detail-value">${admission.department?.name}</div>
                                        </div>
                                    </div>
                                    <div class="detail-item">
                                        <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                            <line x1="16" x2="16" y1="2" y2="6"/>
                                            <line x1="8" x2="8" y1="2" y2="6"/>
                                            <line x1="3" x2="21" y1="10" y2="10"/>
                                        </svg>
                                        <div>
                                            <div class="detail-label">Academic Session</div>
                                            <div class="detail-value">${admission.admission_session?.name}</div>
                                        </div>
                                    </div>
                                    <div class="detail-item">
                                        <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <div>
                                            <div class="detail-label">Application Number</div>
                                            <div class="detail-value">${admission.application?.application_number}</div>
                                        </div>
                                    </div>
                                    <div class="detail-item">
                                        <svg class="detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                                            <circle cx="12" cy="13" r="3"/>
                                        </svg>
                                        <div>
                                            <div class="detail-label">Admission Status</div>
                                            <div class="detail-value" style="color: #059669;">Confirmed</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p class="letter-paragraph">
                                <strong>Important Information:</strong>
                            </p>

                            <ul class="letter-paragraph" style="list-style-type: disc; margin-left: 1rem; margin-bottom: 1rem;">
                                <li>Registration will commence on <span class="highlight">[Registration Start Date]</span></li>
                                <li>All required documents must be submitted during registration</li>
                                <li>Orientation program will be held on <span class="highlight">[Orientation Date]</span></li>
                                <li>Academic activities will begin on <span class="highlight">[Academic Start Date]</span></li>
                            </ul>

                            <p class="letter-paragraph">
                                Please ensure you complete all necessary registration procedures within the stipulated timeframe. 
                                Failure to do so may result in the forfeiture of your admission.
                            </p>

                            <p class="letter-paragraph">
                                We look forward to welcoming you to our campus and supporting you throughout your academic journey.
                            </p>

                            <p class="letter-paragraph">
                                Congratulations once again!
                            </p>

                            <!-- Signature Section -->
                            <div style="margin-top: 3rem;">
                                <p class="letter-paragraph">
                                    Yours sincerely,
                                </p>
                                <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-top: 2rem;">
                                    <div>
                                        <div style="width: 12rem; height: 1px; background-color: #111827; margin-bottom: 0.5rem;"></div>
                                        <p style="font-weight: 500; color: #111827;">${schoolSettings?.registrar_name || 'Registrar'}</p>
                                        <p style="font-size: 0.875rem; color: #6b7280;">${schoolSettings?.registrar_title || 'Registrar'} - ${schoolSettings?.school_name || 'University Name'}</p>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="width: 8rem; height: 1px; background-color: #111827; margin-bottom: 0.5rem;"></div>
                                        <p style="font-weight: 500; color: #111827;">Date</p>
                                        <p style="font-size: 0.875rem; color: #6b7280;">${formatDate(new Date())}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center; font-size: 0.875rem; color: #6b7280;">
                                <p>This is an official document. Please keep it safe.</p>
                                <p style="margin-top: 0.5rem;">
                                    For inquiries, contact: 
                                    <span style="font-weight: 500;">${schoolSettings?.school_email || 'admissions@university.edu.ng'}</span> | 
                                    <span style="font-weight: 500;">${schoolSettings?.school_phone || '+234 XXX XXX XXXX'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Admission Letter',
                text: `I have been admitted to ${admission.department?.name} at the university!`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link Copied",
                description: "Admission letter link copied to clipboard",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading admission letter...</p>
                </div>
            </div>
        );
    }

    if (!admission) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="text-gray-500">
                        <h3 className="text-lg font-medium mb-2">Admission Not Found</h3>
                        <p>The admission letter you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/admission-offers')} className="mt-4">
                            Back to Offers
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center header-actions pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admission Letter</h1>
                    <p className="text-gray-600 mt-1">
                        Congratulations on your admission to {admission.department?.name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Admission Status Badge */}
            <div className="flex justify-center status-badge">
                <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
                    <FileText className="w-5 h-5 mr-2" />
                    Admission Confirmed
                </Badge>
            </div>

            {/* Admission Letter Content */}
            <Card className="print:shadow-none print:border-0 admission-letter-content admission-letter-card">
                <CardContent className="p-8 pl-12 relative admission-letter-content" id="admission-letter-content">
                    {/* Single vertical blue border line on the left */}
                    <div className="absolute left-0 top-0 bottom-0 w-[8px] blue-border-print" style={{borderLeft: '8px solid #1e40af'}}></div>
                    
                    {/* Logo Watermark Background */}
                    <div className="absolute inset-0 watermark-print" style={{
                        backgroundImage: schoolSettings?.print_logo 
                            ? `url("${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${schoolSettings.print_logo}")`
                            : `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='20' x='4' y='2' rx='2' ry='2' fill='%232563eb'/%3E%3Cpath d='M9 22v-4h6v4' fill='%232563eb'/%3E%3Cpath d='M8 6h.01' fill='%232563eb'/%3E%3Cpath d='M16 6h.01' fill='%232563eb'/%3E%3Cpath d='M12 6h.01' fill='%232563eb'/%3E%3Cpath d='M12 10h.01' fill='%232563eb'/%3E%3Cpath d='M12 14h.01' fill='%232563eb'/%3E%3Cpath d='M16 10h.01' fill='%232563eb'/%3E%3Cpath d='M16 14h.01' fill='%232563eb'/%3E%3Cpath d='M8 10h.01' fill='%232563eb'/%3E%3Cpath d='M8 14h.01' fill='%232563eb'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '500px 500px',
                        opacity: 0.12,
                        pointerEvents: 'none',
                        zIndex: 0
                    }}></div>
                    {/* University Header */}
                    <div className="text-center mb-8 pb-6 border-b border-gray-300">
                        <div className="flex items-center justify-center mb-4">
                            {schoolSettings?.print_logo ? (
                                <img 
                                    src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${schoolSettings.print_logo}`}
                                    alt="School Logo"
                                    className="w-16 h-16 object-contain mr-4"
                                    onError={(e) => {
                                        console.error('Logo failed to load:', e.target.src);
                                        e.target.style.display = 'none';
                                    }}
                                    onLoad={() => console.log('Logo loaded successfully')}
                                />
                            ) : (
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                                    <Building className="w-8 h-8 text-white" />
                                </div>
                            )}
                            <div className="text-left">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {schoolSettings?.school_name || 'UNIVERSITY NAME'}
                                </h2>
                                <p className="text-gray-600 italic text-sm">
                                    "{schoolSettings?.school_motto || 'Excellence in Education'}"
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>{schoolSettings?.school_address || 'University Address, City, State'}</p>
                            <p>
                                Phone: {schoolSettings?.school_phone || '+234 XXX XXX XXXX'} | 
                                Email: {schoolSettings?.school_email || 'info@university.edu.ng'}
                            </p>
                        </div>
                    </div>

                    {/* Letter Content */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 mb-2">Date: {formatDate(new Date())}</p>
                                <p className="text-gray-600 mb-2"><strong>Ref: ADM/{admission.admission_session?.name}/{admission.application?.application_number}</strong></p>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    Candidate: {admission.application?.full_name || admission.application?.first_name + ' ' + admission.application?.last_name || admission.full_name || 'N/A'}
                                </h4>
                                <p className="text-gray-600">
                                    {admission.application?.address || 'Student Address'}
                                </p>
                            </div>
                            {admission.application?.passport && (
                                <div className="ml-4 relative candidate-photo-container">
                                    <img 
                                        src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/storage/${admission.application.passport}`}
                                        alt="Candidate Photo"
                                        className="w-24 h-32 object-cover border-2 border-gray-300 rounded candidate-photo"
                                        onError={(e) => {
                                            console.error('Candidate photo failed to load:', e.target.src);
                                            e.target.style.display = 'none';
                                        }}
                                        onLoad={(e) => {
                                            console.log('Candidate photo loaded successfully:', e.target.src);
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded candidate-watermark">
                                        <span className="text-white text-xs font-semibold text-center px-1 leading-tight">
                                            {admission.application?.application_number}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900 text-center">ADMISSION LETTER</h3>
                            
                            <p className="text-gray-700 leading-relaxed">
                                Dear <span className="font-medium">{admission.application?.full_name || admission.application?.first_name + ' ' + admission.application?.last_name || admission.full_name || 'Student'}</span>,
                            </p>

                            <p className="text-gray-700 leading-relaxed">
                                We are pleased to inform you that your application for admission into the 
                                <span className="font-medium"> {admission.department?.name} </span>
                                program for the <span className="font-medium">{admission.admission_session?.name}</span> 
                                academic session has been successful.
                            </p>

                            <p className="text-gray-700 leading-relaxed">
                                This letter serves as official confirmation of your admission to our prestigious institution. 
                                We congratulate you on this achievement and welcome you to our academic community.
                            </p>

                            {/* Admission Details */}
                            <div className="bg-gray-50 p-6 rounded-lg my-6">
                                <h4 className="font-bold text-gray-900 mb-4">Admission Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Program</p>
                                            <p className="font-medium">{admission.department?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Academic Session</p>
                                            <p className="font-medium">{admission.admission_session?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Application Number</p>
                                            <p className="font-medium">{admission.application?.application_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Admission Status</p>
                                            <p className="font-medium text-green-600">Confirmed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed">
                                <strong>Important Information:</strong>
                            </p>

                            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>Registration will commence on <span className="font-medium">[Registration Start Date]</span></li>
                                <li>All required documents must be submitted during registration</li>
                                <li>Orientation program will be held on <span className="font-medium">[Orientation Date]</span></li>
                                <li>Academic activities will begin on <span className="font-medium">[Academic Start Date]</span></li>
                            </ul>

                            <p className="text-gray-700 leading-relaxed">
                                Please ensure you complete all necessary registration procedures within the stipulated timeframe. 
                                Failure to do so may result in the forfeiture of your admission.
                            </p>

                            <p className="text-gray-700 leading-relaxed">
                                We look forward to welcoming you to our campus and supporting you throughout your academic journey.
                            </p>

                            <p className="text-gray-700 leading-relaxed">
                                Congratulations once again!
                            </p>
                        </div>

                        {/* Signature Section */}
                        <div className="mt-12">
                            <p className="text-gray-700 mb-8">
                                Yours sincerely,
                            </p>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="w-48 h-0.5 bg-gray-900 mb-2"></div>
                                    <p className="font-medium text-gray-900">
                                        {schoolSettings?.registrar_name || 'Registrar'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {schoolSettings?.registrar_title || 'Registrar'} - {schoolSettings?.school_name || 'University Name'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="w-32 h-0.5 bg-gray-900 mb-2"></div>
                                    <p className="font-medium text-gray-900">Date</p>
                                    <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                            <p>This is an official document. Please keep it safe.</p>
                            <p className="mt-2">
                                For inquiries, contact: 
                                <span className="font-medium"> {schoolSettings?.school_email || 'admissions@university.edu.ng'}</span> | 
                                <span className="font-medium"> {schoolSettings?.school_phone || '+234 XXX XXX XXXX'}</span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 print:hidden">
                <Button onClick={() => navigate('/admission-offers')} variant="outline">
                    Back to Offers
                </Button>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                    Go to Dashboard
                </Button>
            </div>
        </div>
    );
};

export default AdmissionLetter; 