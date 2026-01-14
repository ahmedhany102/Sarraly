import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseContactSettings } from '@/hooks/useSupabaseContactSettings';
import { Loader2, HelpCircle, ExternalLink } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
    question: string;
    answer: string;
    link_url?: string;
}

const FAQ = () => {
    const { settings, loading } = useSupabaseContactSettings();

    // Parse FAQ list
    const faqList: FAQItem[] = React.useMemo(() => {
        if (!settings?.faq_list) return [];
        try {
            const parsed = typeof settings.faq_list === 'string'
                ? JSON.parse(settings.faq_list)
                : settings.faq_list;
            return Array.isArray(parsed) ? parsed.filter(faq => faq.question && faq.answer) : [];
        } catch (e) {
            console.error('Error parsing FAQ list:', e);
            return [];
        }
    }, [settings?.faq_list]);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader className="text-center border-b">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <HelpCircle className="w-8 h-8 text-primary" />
                            <CardTitle className="text-2xl md:text-3xl">الأسئلة الشائعة</CardTitle>
                        </div>
                        <p className="text-muted-foreground">Frequently Asked Questions</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : faqList.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full space-y-2">
                                {faqList.map((faq, index) => (
                                    <AccordionItem
                                        key={index}
                                        value={`faq-${index}`}
                                        className="border rounded-lg px-4 bg-muted/30"
                                    >
                                        <AccordionTrigger className="text-right hover:no-underline py-4">
                                            <div className="flex items-center gap-3 text-right w-full">
                                                <span className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                                                    {index + 1}
                                                </span>
                                                <span className="flex-1 font-medium">{faq.question}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-right pb-4 pr-10">
                                            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {faq.answer}
                                            </div>
                                            {faq.link_url && faq.link_url.trim() !== '' && (
                                                <a
                                                    href={faq.link_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-primary hover:underline mt-3 font-medium"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span>زيارة الرابط</span>
                                                </a>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">لا توجد أسئلة شائعة حالياً.</p>
                                <p className="text-sm mt-2">سيتم إضافة الأسئلة الشائعة قريباً.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contact CTA */}
                <div className="max-w-4xl mx-auto mt-6 text-center">
                    <Card className="bg-muted/50">
                        <CardContent className="py-6">
                            <p className="text-muted-foreground mb-2">لم تجد إجابة لسؤالك؟</p>
                            <a
                                href="/contact"
                                className="text-primary font-bold hover:underline"
                            >
                                تواصل معنا مباشرة ←
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default FAQ;
