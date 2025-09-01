'use client'

import { useState } from 'react'
import { 
  ClipboardIcon, 
  CheckIcon,
  ShareIcon,
  QrCodeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface SocialMediaKitProps {
  businessId: string
  businessName: string
  phoneNumber?: string
  bookingUrl: string
}

export default function SocialMediaKit({ 
  businessId, 
  businessName, 
  phoneNumber, 
  bookingUrl 
}: SocialMediaKitProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(item)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const socialPosts = [
    {
      platform: 'Instagram',
      icon: '📸',
      color: 'from-purple-400 to-pink-400',
      caption: `✨ Book your next nail appointment instantly! ✨

📱 Click the link in our bio or call ${phoneNumber || '(phone number)'}
⏰ Available 24/7 - even when we're closed!
💅 Full service menu available online

#NailSalon #BookOnline #NailArt #ManicurePedicure #${businessName.replace(/\s+/g, '')}`,
      hashtags: '#nails #manicure #pedicure #bookings #nailart #nailsalon'
    },
    {
      platform: 'Facebook',
      icon: '👍',
      color: 'from-blue-500 to-blue-600',
      caption: `🎉 Exciting News! You can now book your nail appointments online 24/7!

No more waiting on hold or playing phone tag. Our new booking system lets you:
✅ See real-time availability
✅ Choose your preferred time
✅ Get instant confirmations
✅ Manage your appointments

Book now: ${bookingUrl}
Or call: ${phoneNumber || '(phone number)'}

#NailSalon #OnlineBooking #Convenience #CustomerService`,
      hashtags: ''
    },
    {
      platform: 'TikTok',
      icon: '🎵',
      color: 'from-black to-gray-800',
      caption: `POV: You can finally book your nail appointment at 2am 🌙

✨ 24/7 online booking now available
📱 Link in bio
💅 Your nails will thank you

#NailTok #BookingHack #NailSalon #ConvenienceQueen #NightOwlBooking`,
      hashtags: '#nailtok #booking #nailsalon #convenience'
    },
    {
      platform: 'Stories/General',
      icon: '📱',
      color: 'from-gradient-to-r from-purple-500 to-blue-500',
      caption: `Book your appointment online!
${bookingUrl}
Available 24/7 💅✨`,
      hashtags: ''
    }
  ]

  const generateQRCode = () => {
    // In a real implementation, you'd use a QR code library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}&bgcolor=8B5CF6&color=FFFFFF`
    return qrUrl
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">📱 Social Media Booking Kit</h3>
        <p className="text-gray-600">Ready-to-use content for your social media</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => copyToClipboard(bookingUrl, 'url')}
          className="flex items-center justify-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          {copiedItem === 'url' ? (
            <CheckIcon className="w-5 h-5 text-green-600" />
          ) : (
            <ClipboardIcon className="w-5 h-5 text-blue-600" />
          )}
          <span className="text-blue-800 font-medium">
            {copiedItem === 'url' ? 'Copied!' : 'Copy Booking URL'}
          </span>
        </button>

        <button
          onClick={() => window.open(generateQRCode(), '_blank')}
          className="flex items-center justify-center space-x-2 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
        >
          <QrCodeIcon className="w-5 h-5 text-purple-600" />
          <span className="text-purple-800 font-medium">Generate QR Code</span>
        </button>

        <button
          className="flex items-center justify-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
        >
          <PhotoIcon className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Create Graphics</span>
        </button>
      </div>

      {/* Social Media Posts */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">📝 Ready-to-Post Content</h4>
        
        {socialPosts.map((post, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${post.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white text-lg">{post.icon}</span>
                </div>
                <div>
                  <h5 className="font-semibold">{post.platform}</h5>
                  <p className="text-sm text-gray-600">Ready to copy & paste</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(post.caption, `post-${index}`)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                {copiedItem === `post-${index}` ? (
                  <>
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <ClipboardIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600 text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {post.caption}
              </pre>
              {post.hashtags && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Suggested hashtags:</p>
                  <p className="text-sm text-blue-600">{post.hashtags}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Marketing Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-semibold text-yellow-800 mb-3">💡 Social Media Marketing Tips</h4>
        <div className="space-y-2 text-sm text-yellow-700">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">📌</span>
            <span><strong>Pin your booking post</strong> to the top of your profile</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">📱</span>
            <span><strong>Add booking link to your bio</strong> on all platforms</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">📸</span>
            <span><strong>Post nail work photos</strong> with booking call-to-action</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">⏰</span>
            <span><strong>Post during peak hours</strong> (lunch time, evenings)</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">🎯</span>
            <span><strong>Use location tags</strong> to attract local customers</span>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold">📱 QR Code for In-Store Use</h4>
            <p className="text-sm text-gray-600">Print and display in your salon</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="bg-purple-600 p-4 rounded-lg">
            <img 
              src={generateQRCode()} 
              alt="Booking QR Code" 
              className="w-24 h-24"
            />
          </div>
          <div className="flex-1">
            <h5 className="font-medium mb-2">How to use:</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• Print and place near checkout/waiting area</div>
              <div>• Add to business cards</div>
              <div>• Include in email signatures</div>
              <div>• Post in Instagram stories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}