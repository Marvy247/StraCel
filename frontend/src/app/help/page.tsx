'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TestnetBanner from '@/components/TestnetBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Shield, Wallet, ShoppingCart, AlertTriangle } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      question: 'What is Stracel?',
      answer: 'Stracel is a decentralized marketplace built on the Celo blockchain. It allows users to buy and sell goods securely using smart contracts, without the need for intermediaries.',
    },
    {
      question: 'How do I connect my wallet?',
      answer: 'Click the "Connect Wallet" button in the header. You\'ll need a Celo-compatible wallet like MetaMask to interact with the marketplace. Make sure you are on the Celo Mainnet network.',
    },
    {
      question: 'How do I create a listing?',
      answer: 'Once your wallet is connected, click the "Create Listing" button on the marketplace page. Fill in the item details including name, description, price (in CELO or G$), and duration (in days). You can also upload an image to make your listing more attractive.',
    },
    {
      question: 'How do purchases work?',
      answer: 'When you click "Buy with CELO" or "Buy with G$" on a listing, you will first see a confirmation screen showing exactly what you are buying and how much you will pay. The funds are sent directly to the seller via smart contract. Once confirmed on the blockchain, the purchase is recorded in your Order History.',
    },
    {
      question: 'Can I cancel my listing?',
      answer: 'Yes! If you\'re the seller and your listing is still active, you can cancel it from the "My Listings" page. Click the "Cancel Listing" button and confirm the transaction in your wallet.',
    },
    {
      question: 'What happens when a listing expires?',
      answer: 'Listings have a duration set by the seller (measured in Celo blocks). When this time passes, the listing automatically expires and can no longer be purchased. Expired listings can be viewed in the seller\'s "My Listings" page.',
    },
    {
      question: 'Where does my money go when I buy?',
      answer: 'When you make a purchase, your CELO or G$ is sent directly to the seller\'s wallet via the smart contract. The transaction is recorded on-chain and appears in your Order History page so you always know where your funds went.',
    },
    {
      question: 'What is G$ (GoodDollar)?',
      answer: 'G$ is a stablecoin on Celo that maintains a stable value. Stracel supports both CELO and G$ for listing and purchasing items. When buying with G$, you will need to approve the marketplace contract to spend your G$ tokens (this is handled automatically during purchase).',
    },
    {
      question: 'What are gas fees?',
      answer: 'Gas fees are small transaction costs paid to process your transaction on the Celo blockchain. These fees are denominated in CELO and are very low compared to other blockchains. Your wallet will show you the estimated fee before you confirm any transaction.',
    },
    {
      question: 'Is this real money?',
      answer: 'Stracel is deployed on Celo Mainnet. All transactions use real CELO and G$ tokens. Please use caution and only transact with trusted parties.',
    },
  ];

  const safetyTips = [
    'Always verify the seller\'s address before making a purchase',
    'Check the listing expiration block to ensure it is still active',
    'Make sure you have enough CELO for gas fees and the purchase amount',
    'Never share your private keys or seed phrase with anyone',
    'Double-check all transaction details before confirming in your wallet',
    'For G$ purchases, ensure you have approved the marketplace contract (handled automatically)',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TestnetBanner />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-slate-900" />
            <h1 className="text-3xl font-bold text-slate-900">Help & FAQ</h1>
          </div>
          <p className="text-slate-600">
            Everything you need to know about using Stracel marketplace
          </p>
        </div>

        {/* Safety Tips */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Safety Tips</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              Important reminders for safe marketplace usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Quick Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <CardTitle>For Sellers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p><strong>1.</strong> Connect your Celo wallet (MetaMask)</p>
              <p><strong>2.</strong> Click "Create Listing"</p>
              <p><strong>3.</strong> Fill in item details, set price in CELO or G$</p>
              <p><strong>4.</strong> Confirm transaction in wallet</p>
              <p><strong>5.</strong> Manage listings in "My Listings"</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <CardTitle>For Buyers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p><strong>1.</strong> Connect your Celo wallet (MetaMask)</p>
              <p><strong>2.</strong> Browse available listings</p>
              <p><strong>3.</strong> Review item, price, and seller details</p>
              <p><strong>4.</strong> Click "Buy with CELO" or "Buy with G$" and confirm</p>
              <p><strong>5.</strong> View the purchase in "My Orders" history</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Still need help?</CardTitle>
            <CardDescription>
              We're here to help you get the most out of Stracel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>For technical issues or questions not covered here:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check the Celo blockchain explorer (explorer.celo.org) for transaction status</li>
              <li>Visit our GitHub repository for technical documentation</li>
              <li>Join our community Discord for support</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
