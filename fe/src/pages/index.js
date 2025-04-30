import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState, useRef, useEffect, use } from "react";

import { auth, provider, signInWithPopup } from "../../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add this constant at the top of your file, outside the component
const COUNTRY_CODES = [
  { code: '+93', country: '🇦🇫 Afghanistan' },
  { code: '+355', country: '🇦🇱 Albania' },
  { code: '+213', country: '🇩🇿 Algeria' },
  { code: '+376', country: '🇦🇩 Andorra' },
  { code: '+244', country: '🇦🇴 Angola' },
  { code: '+1', country: '🇦🇮 Antigua' },
  { code: '+54', country: '🇦🇷 Argentina' },
  { code: '+374', country: '🇦🇲 Armenia' },
  { code: '+61', country: '🇦🇺 Australia' },
  { code: '+43', country: '🇦🇹 Austria' },
  { code: '+994', country: '🇦🇿 Azerbaijan' },
  { code: '+1', country: '🇧🇸 Bahamas' },
  { code: '+973', country: '🇧🇭 Bahrain' },
  { code: '+880', country: '🇧🇩 Bangladesh' },
  { code: '+1', country: '🇧🇧 Barbados' },
  { code: '+375', country: '🇧🇾 Belarus' },
  { code: '+32', country: '🇧🇪 Belgium' },
  { code: '+501', country: '🇧🇿 Belize' },
  { code: '+229', country: '🇧🇯 Benin' },
  { code: '+975', country: '🇧🇹 Bhutan' },
  { code: '+591', country: '🇧🇴 Bolivia' },
  { code: '+387', country: '🇧🇦 Bosnia' },
  { code: '+267', country: '🇧🇼 Botswana' },
  { code: '+55', country: '🇧🇷 Brazil' },
  { code: '+673', country: '🇧🇳 Brunei' },
  { code: '+359', country: '🇧🇬 Bulgaria' },
  { code: '+226', country: '🇧🇫 Burkina Faso' },
  { code: '+257', country: '🇧🇮 Burundi' },
  { code: '+855', country: '🇰🇭 Cambodia' },
  { code: '+237', country: '🇨🇲 Cameroon' },
  { code: '+1', country: '🇨🇦 Canada' },
  { code: '+238', country: '🇨🇻 Cape Verde' },
  { code: '+236', country: '🇨🇫 Central African Republic' },
  { code: '+235', country: '🇹🇩 Chad' },
  { code: '+56', country: '🇨🇱 Chile' },
  { code: '+86', country: '🇨🇳 China' },
  { code: '+57', country: '🇨🇴 Colombia' },
  { code: '+269', country: '🇰🇲 Comoros' },
  { code: '+242', country: '🇨🇬 Congo' },
  { code: '+506', country: '🇨🇷 Costa Rica' },
  { code: '+385', country: '🇭🇷 Croatia' },
  { code: '+53', country: '🇨🇺 Cuba' },
  { code: '+357', country: '🇨🇾 Cyprus' },
  { code: '+420', country: '🇨🇿 Czech Republic' },
  { code: '+45', country: '🇩🇰 Denmark' },
  { code: '+253', country: '🇩🇯 Djibouti' },
  { code: '+1', country: '🇩🇲 Dominica' },
  { code: '+1', country: '🇩🇴 Dominican Republic' },
  { code: '+670', country: '🇹🇱 East Timor' },
  { code: '+593', country: '🇪🇨 Ecuador' },
  { code: '+20', country: '🇪🇬 Egypt' },
  { code: '+503', country: '🇸🇻 El Salvador' },
  { code: '+240', country: '🇬🇶 Equatorial Guinea' },
  { code: '+291', country: '🇪🇷 Eritrea' },
  { code: '+372', country: '🇪🇪 Estonia' },
  { code: '+251', country: '🇪🇹 Ethiopia' },
  { code: '+679', country: '🇫🇯 Fiji' },
  { code: '+358', country: '🇫🇮 Finland' },
  { code: '+33', country: '🇫🇷 France' },
  { code: '+241', country: '🇬🇦 Gabon' },
  { code: '+220', country: '🇬🇲 Gambia' },
  { code: '+995', country: '🇬🇪 Georgia' },
  { code: '+49', country: '🇩🇪 Germany' },
  { code: '+233', country: '🇬🇭 Ghana' },
  { code: '+30', country: '🇬🇷 Greece' },
  { code: '+1', country: '🇬🇩 Grenada' },
  { code: '+502', country: '🇬🇹 Guatemala' },
  { code: '+224', country: '🇬🇳 Guinea' },
  { code: '+245', country: '🇬🇼 Guinea-Bissau' },
  { code: '+592', country: '🇬🇾 Guyana' },
  { code: '+509', country: '🇭🇹 Haiti' },
  { code: '+504', country: '🇭🇳 Honduras' },
  { code: '+852', country: '🇭🇰 Hong Kong' },
  { code: '+36', country: '🇭🇺 Hungary' },
  { code: '+354', country: '🇮🇸 Iceland' },
  { code: '+91', country: '🇮🇳 India' },
  { code: '+62', country: '🇮🇩 Indonesia' },
  { code: '+98', country: '🇮🇷 Iran' },
  { code: '+964', country: '🇮🇶 Iraq' },
  { code: '+353', country: '🇮🇪 Ireland' },
  { code: '+972', country: '🇮🇱 Israel' },
  { code: '+39', country: '🇮🇹 Italy' },
  { code: '+1', country: '🇯🇲 Jamaica' },
  { code: '+81', country: '🇯🇵 Japan' },
  { code: '+962', country: '🇯🇴 Jordan' },
  { code: '+7', country: '🇰🇿 Kazakhstan' },
  { code: '+254', country: '🇰🇪 Kenya' },
  { code: '+686', country: '🇰🇮 Kiribati' },
  { code: '+850', country: '🇰🇵 North Korea' },
  { code: '+82', country: '🇰🇷 South Korea' },
  { code: '+965', country: '🇰🇼 Kuwait' },
  { code: '+996', country: '🇰🇬 Kyrgyzstan' },
  { code: '+856', country: '🇱🇦 Laos' },
  { code: '+371', country: '🇱🇻 Latvia' },
  { code: '+961', country: '🇱🇧 Lebanon' },
  { code: '+266', country: '🇱🇸 Lesotho' },
  { code: '+231', country: '🇱🇷 Liberia' },
  { code: '+218', country: '🇱🇾 Libya' },
  { code: '+423', country: '🇱🇮 Liechtenstein' },
  { code: '+370', country: '🇱🇹 Lithuania' },
  { code: '+352', country: '🇱🇺 Luxembourg' },
  { code: '+853', country: '🇲🇴 Macau' },
  { code: '+389', country: '🇲🇰 Macedonia' },
  { code: '+261', country: '🇲🇬 Madagascar' },
  { code: '+265', country: '🇲🇼 Malawi' },
  { code: '+60', country: '🇲🇾 Malaysia' },
  { code: '+960', country: '🇲🇻 Maldives' },
  { code: '+223', country: '🇲🇱 Mali' },
  { code: '+356', country: '🇲🇹 Malta' },
  { code: '+692', country: '🇲🇭 Marshall Islands' },
  { code: '+222', country: '🇲🇷 Mauritania' },
  { code: '+230', country: '🇲🇺 Mauritius' },
  { code: '+52', country: '🇲🇽 Mexico' },
  { code: '+691', country: '🇫🇲 Micronesia' },
  { code: '+373', country: '🇲🇩 Moldova' },
  { code: '+377', country: '🇲🇨 Monaco' },
  { code: '+976', country: '🇲🇳 Mongolia' },
  { code: '+382', country: '🇲🇪 Montenegro' },
  { code: '+212', country: '🇲🇦 Morocco' },
  { code: '+258', country: '🇲🇿 Mozambique' },
  { code: '+95', country: '🇲🇲 Myanmar' },
  { code: '+264', country: '🇳🇦 Namibia' },
  { code: '+674', country: '🇳🇷 Nauru' },
  { code: '+977', country: '🇳🇵 Nepal' },
  { code: '+31', country: '🇳🇱 Netherlands' },
  { code: '+64', country: '🇳🇿 New Zealand' },
  { code: '+505', country: '🇳🇮 Nicaragua' },
  { code: '+227', country: '🇳🇪 Niger' },
  { code: '+234', country: '🇳🇬 Nigeria' },
  { code: '+47', country: '🇳🇴 Norway' },
  { code: '+968', country: '🇴🇲 Oman' },
  { code: '+92', country: '🇵🇰 Pakistan' },
  { code: '+680', country: '🇵🇼 Palau' },
  { code: '+970', country: '🇵🇸 Palestine' },
  { code: '+507', country: '🇵🇦 Panama' },
  { code: '+675', country: '🇵🇬 Papua New Guinea' },
  { code: '+595', country: '🇵🇾 Paraguay' },
  { code: '+51', country: '🇵🇪 Peru' },
  { code: '+63', country: '🇵🇭 Philippines' },
  { code: '+48', country: '🇵🇱 Poland' },
  { code: '+351', country: '🇵🇹 Portugal' },
  { code: '+974', country: '🇶🇦 Qatar' },
  { code: '+40', country: '🇷🇴 Romania' },
  { code: '+7', country: '🇷🇺 Russia' },
  { code: '+250', country: '🇷🇼 Rwanda' },
  { code: '+1', country: '🇰🇳 Saint Kitts and Nevis' },
  { code: '+1', country: '🇱🇨 Saint Lucia' },
  { code: '+1', country: '🇻🇨 Saint Vincent' },
  { code: '+685', country: '🇼🇸 Samoa' },
  { code: '+378', country: '🇸🇲 San Marino' },
  { code: '+239', country: '🇸🇹 Sao Tome and Principe' },
  { code: '+966', country: '🇸🇦 Saudi Arabia' },
  { code: '+221', country: '🇸🇳 Senegal' },
  { code: '+381', country: '🇷🇸 Serbia' },
  { code: '+248', country: '🇸🇨 Seychelles' },
  { code: '+232', country: '🇸🇱 Sierra Leone' },
  { code: '+65', country: '🇸🇬 Singapore' },
  { code: '+421', country: '🇸🇰 Slovakia' },
  { code: '+386', country: '🇸🇮 Slovenia' },
  { code: '+677', country: '🇸🇧 Solomon Islands' },
  { code: '+252', country: '🇸🇴 Somalia' },
  { code: '+27', country: '🇿🇦 South Africa' },
  { code: '+211', country: '🇸🇸 South Sudan' },
  { code: '+34', country: '🇪🇸 Spain' },
  { code: '+94', country: '🇱🇰 Sri Lanka' },
  { code: '+249', country: '🇸🇩 Sudan' },
  { code: '+597', country: '🇸🇷 Suriname' },
  { code: '+268', country: '🇸🇿 Swaziland' },
  { code: '+46', country: '🇸🇪 Sweden' },
  { code: '+41', country: '🇨🇭 Switzerland' },
  { code: '+963', country: '🇸🇾 Syria' },
  { code: '+886', country: '🇹🇼 Taiwan' },
  { code: '+992', country: '🇹🇯 Tajikistan' },
  { code: '+255', country: '🇹🇿 Tanzania' },
  { code: '+66', country: '🇹🇭 Thailand' },
  { code: '+228', country: '🇹🇬 Togo' },
  { code: '+676', country: '🇹🇴 Tonga' },
  { code: '+1', country: '🇹🇹 Trinidad and Tobago' },
  { code: '+216', country: '🇹🇳 Tunisia' },
  { code: '+90', country: '🇹🇷 Turkey' },
  { code: '+993', country: '🇹🇲 Turkmenistan' },
  { code: '+688', country: '🇹🇻 Tuvalu' },
  { code: '+256', country: '🇺🇬 Uganda' },
  { code: '+380', country: '🇺🇦 Ukraine' },
  { code: '+971', country: '🇦🇪 United Arab Emirates' },
  { code: '+44', country: '🇬🇧 United Kingdom' },
  { code: '+1', country: '🇺🇸 United States' },
  { code: '+598', country: '🇺🇾 Uruguay' },
  { code: '+998', country: '🇺🇿 Uzbekistan' },
  { code: '+678', country: '🇻🇺 Vanuatu' },
  { code: '+379', country: '🇻🇦 Vatican City' },
  { code: '+58', country: '🇻🇪 Venezuela' },
  { code: '+84', country: '🇻🇳 Vietnam' },
  { code: '+967', country: '🇾🇪 Yemen' },
  { code: '+260', country: '🇿🇲 Zambia' },
  { code: '+263', country: '🇿🇼 Zimbabwe' }
];

export default function Home() {

  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);


  const sendOtp = async (phone) => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmationResult);
    } catch (error) {
      console.error("Error sending code:", error);
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await confirmationResult.confirm(otp);
      console.log("✅ User signed in:", result.user);
    } catch (err) {
      console.error("❌ Invalid OTP:", err);
    }
  };



  const [currentSection, setCurrentSection] = useState('hero');
  const containerRef = useRef(null);
  const [selectedFaces, setSelectedFaces] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    sexualOrientation: '',
    personalityAnswers: Array(10).fill(null),
    selectedFaces: [],
    selfieImage: null,
    userFaceType: null,
    mbti: ''
  });
  const [matchResults, setMatchResults] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countryCode, setCountryCode] = useState('+1');
  const [verificationInputs, setVerificationInputs] = useState(['', '', '', '', '', '']);
  const [userLocation, setUserLocation] = useState(null);
  const [matchLocations, setMatchLocations] = useState({});
  const [watchId, setWatchId] = useState(null);
  const [compass, setCompass] = useState(null);
  const [locationStatus, setLocationStatus] = useState('waiting'); // 'waiting', 'active', 'error'
  const [compassStatus, setCompassStatus] = useState('waiting'); // 'waiting', 'active', 'error'

  // Define section order for navigation
  const sectionOrder = [
    'hero', 
    // 'phone', 
    // 'otp',
    'email',
    'user-info', 
    'mbti1', 
    'mbti2', 
    'mbti3', 
    'mbti4', 
    'mbti5', 
    'mbti6', 
    'mbti7', 
    'mbti8', 
    'mbti9', 
    'mbti10',
    'face-preferences',
    'selfie-upload',
    'submit',
    'location-direction'
  ];

  // Add these arrays at the top of your component, after the state declarations
  const womenFaces = [
    'women/asian_cute.jpg',
    'women/persian.jpg',
    'women/asian.jpg',
    'women/latina.png',
    'women/nerdy.png',
    'women/plumpy.png',
    'women/swedish.png',
    'women/chubby.jpeg',
    'women/exotic_chiseled.jpg'
    // Add all women reference faces here
  ];

  const menFaces = [
    'men/black_man.jpg',
    'men/nerdy_clean.jpg',
    'men/white_artsy.jpg',
    'men/white_beard.png',
    'men/white_masculine.jpg',
    // Add all men reference faces here
  ];

  const handleMatch = async () => {
   
    try {
      // Get the current user's ID from localStorage
      const storedData = localStorage.getItem('aiMatchmakerData');
      // if (!storedData) {
      //   alert('Please submit your profile first!');
      //   return;
      // }

      // Simplified location permission request
      if ("geolocation" in navigator) {
        setLocationStatus('waiting');
        
        // Directly request location permission
        navigator.geolocation.getCurrentPosition(
          // Success callback
          async (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLocationStatus('active');

            // Start watching location
            const id = navigator.geolocation.watchPosition(
              (pos) => {
                setUserLocation({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude
                });
              },
              (error) => {
                console.error("Error watching location:", error);
                setLocationStatus('error');
              },
              { enableHighAccuracy: true }
            );
            setWatchId(id);

            // After location is obtained, fetch matches
            const response = await fetch(`http://192.168.68.75:8000/match/user_1745062738828`);
            if (!response.ok) {
              throw new Error('Failed to fetch matches');
            }
            const matchData = await response.json();
            setMatchResults(matchData.matches);
            navigateToSection('location-direction');
          },
          // Error callback
          (error) => {
            console.error("Error getting location:", error);
            setLocationStatus('error');
            alert('Please enable location access to find matches near you.');
          },
          // Options
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        setLocationStatus('error');
        alert('Location services are not available on your device.');
      }

    } catch (error) {
      console.error('Error getting matches:', error);
      alert('Failed to find matches. Please try again.');
    }
  };

  const navigateToSection = (section) => {
    setCurrentSection(section);
    const sectionElement = document.getElementById(section);
    if (sectionElement && containerRef.current) {
      containerRef.current.style.transform = `translateY(-${sectionElement.offsetTop}px)`;
    }
  };

  const goBack = () => {
    const currentIndex = sectionOrder.indexOf(currentSection);
    if (currentIndex > 0) {
      navigateToSection(sectionOrder[currentIndex - 1]);
    }
  };

  // Navigation buttons component
  const NavigationButtons = ({ showBack = true }) => (
    <div className="flex gap-4 w-full mt-8">
      {showBack && currentSection !== 'hero' && (
        <button 
          onClick={goBack}
          className="flex-1 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] font-medium px-8 py-3"
        >
          Back
        </button>
      )}
      {currentSection !== 'contact' && (
        <button 
          onClick={() => navigateToSection(sectionOrder[sectionOrder.indexOf(currentSection) + 1])}
          className="flex-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium px-8 py-3"
        >
          {currentSection === 'hero' ? 'Get Started' : 'Next'}
        </button>
      )}
    </div>
  );

  // Add this useEffect to handle camera stream
  useEffect(() => {
    if (showCamera && videoRef.current && !videoRef.current.srcObject) {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })
      .then(stream => {
        videoRef.current.srcObject = stream;
        setStream(stream);
      })
      .catch(err => {
        console.error('Camera error:', err);
        alert('Unable to access camera. Please make sure you have granted camera permissions.');
      });
    }
  }, [showCamera]);

  const getFaceType = async () => {
    if (!selectedImage) {
      alert("Please take a selfie first!");
      return;
    }
  
    try {
      // Convert base64 to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      
      const formData = new FormData();
      formData.append("file", file);
  
      const res = await fetch("http://192.168.68.75:8000/classify-selfie", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      console.log("Tags:", data);
      setFormData(prev => ({
        ...prev,
        userFaceType: data
      }));
  
    } catch (error) {
      console.error("Error saving selfie:", error);
      alert("Failed to save selfie. Please try again.");
    }
  };
  

  // Simplify the startCamera function
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStream(stream);
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please make sure you have granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setShowCamera(false);
  };



  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User logged in:", user.displayName, user.email);
    } catch (error) {
      console.error("Login failed:", error);
    }
  }


  const takePhoto = async () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      
      // Flip the image horizontally for selfie mirror effect
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
      
      const photoUrl = canvas.toDataURL("image/jpeg");
      setSelectedImage(photoUrl);
      setFormData(prev => ({ ...prev, selfieImage: photoUrl }));
      stopCamera();

      // Automatically get face type after taking photo
      try {
        // Convert base64 to blob
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        
        // Create file from blob
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);
    
        const res = await fetch("http://192.168.68.75:8000/classify-selfie", {
          method: "POST",
          body: formData,
        });
    
        const data = await res.json();
        console.log("Face Type:", data);
        setFormData(prev => ({
          ...prev,
          userFaceType: data
        }));
    
      } catch (error) {
        console.error("Error classifying face:", error);
        alert("Failed to analyze face type. Please try again.");
      }
    }
  };

  const getMBTI = (answers) => {
    const axisScores = {
      E: answers[0] + answers[1],
      I: 10 - answers[0] - answers[1],
  
      S: answers[2] + answers[3],
      N: 10 - answers[2] - answers[3],
  
      T: answers[4] + answers[5],
      F: 10 - answers[4] - answers[5],
  
      J: answers[6] + answers[7],
      P: 10 - answers[6] - answers[7],
    };
  
    const mbti =
      (axisScores.E >= axisScores.I ? "E" : "I") +
      (axisScores.S >= axisScores.N ? "S" : "N") +
      (axisScores.T >= axisScores.F ? "T" : "F") +
      (axisScores.J >= axisScores.P ? "J" : "P");
  
    return mbti;
  };

  const handleSubmit = async () => {
    setShowModal(true);
    setIsLoading(true);

    try {
      // Calculate MBTI from personality answers
      const mbtiType = getMBTI(formData.personalityAnswers);
      console.log('MBTI Type:', mbtiType);

      // Update formData with MBTI type and selected faces
      const simpleData = {
        id: `user_${Date.now()}`,
        data: {
          ...formData,
          mbti: mbtiType,
          selectedFaces: Array.from(selectedFaces),
          selfieImage: selectedImage,
          submittedAt: new Date().toISOString()
        }
      };

      console.log('Sending data:', simpleData); // Debug log

      const response = await fetch('http://192.168.68.75:8000/save-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simpleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to save data');
      }

      const result = await response.json();
      console.log('Success:', result);

      // Store the data in localStorage for later use
      localStorage.setItem('aiMatchmakerData', JSON.stringify(simpleData));

      setTimeout(() => {
        setIsLoading(false);
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      alert('Failed to save data. Please try again.');
    }
  };

  const handleSendVerificationCode = async () => {
    const phNum = `${countryCode}${formData.phoneNumber}`
    console.log(phNum);

    sendOtp(phNum);



    // textlink.sendSMS("+61410264014", "Dummy message text...");

    
    // const result = await textlink.sendVerificationSMS(formData.phoneNumber)
    // if (result.ok) {
    //   console.log("ok")
    // }
  };

  const verifyCode = async () => {
    // Combine all digits into a single string
    const enteredCode = verificationInputs.join('');
    
    if (enteredCode.length !== 6) {
      alert('Please enter all 6 digits');
      return;
    }

    try {
      const response = await textlink.verifyCode(formData.phoneNumber, enteredCode);
      // const data = await response.json();
      if (response.ok) {
        // Move to next section on successful verification
        navigateToSection('user-info');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Invalid verification code. Please try again.');
    }
  };

  // Add these utility functions after your state declarations
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1); // Return distance in km with 1 decimal place
  };

  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const λ1 = lon1 * Math.PI / 180;
    const λ2 = lon2 * Math.PI / 180;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
             Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    const bearing = (θ * 180 / Math.PI + 360) % 360;
    return bearing;
  };

  const getDirectionArrow = (bearing, userHeading) => {
    const relativeBearing = (bearing - userHeading + 360) % 360;
    // Return an arrow pointing in the relative direction
    if (relativeBearing >= 337.5 || relativeBearing < 22.5) return '↑';
    if (relativeBearing >= 22.5 && relativeBearing < 67.5) return '↗';
    if (relativeBearing >= 67.5 && relativeBearing < 112.5) return '→';
    if (relativeBearing >= 112.5 && relativeBearing < 157.5) return '↘';
    if (relativeBearing >= 157.5 && relativeBearing < 202.5) return '↓';
    if (relativeBearing >= 202.5 && relativeBearing < 247.5) return '↙';
    if (relativeBearing >= 247.5 && relativeBearing < 292.5) return '←';
    return '↖';
  };

  // Add this component after your utility functions
  const DirectionArrow = ({ bearing, compass }) => {
    const rotation = compass ? (bearing - compass) : bearing;
    
  return (
      <div className="relative w-8 h-8 bg-black/[.05] dark:bg-white/[.06] rounded-full flex items-center justify-center">
        <div 
          className="w-6 h-6 transition-transform duration-200"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className="w-full h-full"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 5l-7 14h14l-7-14z"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className={`${geistSans.className} ${geistMono.className} h-screen overflow-hidden`}>
      <div ref={containerRef} className="transition-transform duration-1000 ease-in-out">
        {/* Hero Section */}
        <section id="hero" className="h-screen flex items-center justify-center p-4">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">AI Matchmaker</h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 font-[family-name:var(--font-geist-mono)]">
              Intelligent matching for meaningful connections
            </p>
            <NavigationButtons showBack={false} />
          </div>
        </section>

        {/* Phone Number Section */}
        <section id="phone" className="h-screen flex items-center bg-black/[.05] dark:bg-white/[.06] p-4">
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Phone Number</h2>
            <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
              <div className="flex gap-2">
                <select 
                  className="w-32 sm:w-40 p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white dark:bg-black border font-[family-name:var(--font-geist-mono)]"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {COUNTRY_CODES.map(({ code, country }) => (
                    <option key={`${code}-${country}`} value={code}>
                      {country}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    // Only allow numbers and limit length
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 10) {
                      setFormData(prev => ({ ...prev, phoneNumber: value }));
                    }
                  }}
                  placeholder="Enter your phone number"
                  className="flex-1 p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white dark:bg-black border font-[family-name:var(--font-geist-mono)]"
                />
              </div>
              <button 
                onClick={handleSendVerificationCode}
                disabled={!formData.phoneNumber || isCodeSent}
                className={`w-full rounded-full border border-solid transition-colors flex items-center justify-center gap-2 font-medium px-8 py-3
                  ${!formData.phoneNumber || isCodeSent
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 border-transparent'
                    : 'bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] border-transparent'
                  }`}
              >
                {isCodeSent ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Code Sent
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
              <p className="text-sm text-center font-[family-name:var(--font-geist-mono)] text-gray-600 dark:text-gray-400">
                We'll send you a verification code to get started
              </p>
              <NavigationButtons />
            </div>
          </div>
        </section>

        {/* OTP Section */}
        <section id="otp" className="h-screen flex items-center bg-black/[.05] dark:bg-white/[.06] p-4">
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Verification Code</h2>
            <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
              <div className="flex justify-between gap-1 sm:gap-2">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    inputMode="numeric"
                    pattern="\d*"
                    value={verificationInputs[index]}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl rounded-lg bg-white dark:bg-black border font-[family-name:var(--font-geist-mono)] focus:border-2 focus:border-black dark:focus:border-white outline-none"
                    onKeyUp={(e) => {
                      // Move to next input when digit is entered
                      if (e.target.value && index < 5) {
                        e.target.nextElementSibling?.focus();
                      }
                      // Move to previous input on backspace if empty
                      if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        e.target.previousElementSibling?.focus();
                      }
                    }}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      
                      // Update the verification inputs array
                      const newInputs = [...verificationInputs];
                      newInputs[index] = value;
                      setVerificationInputs(newInputs);

                      // If pasting a full code
                      if (e.target.value.length > 1) {
                        const pastedValue = e.target.value.replace(/[^0-9]/g, '').split('');
                        const newInputs = [...verificationInputs];
                        for (let i = 0; i < 6; i++) {
                          newInputs[i] = pastedValue[i] || '';
                        }
                        setVerificationInputs(newInputs);
                      }
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-center font-[family-name:var(--font-geist-mono)] text-gray-600 dark:text-gray-400">
                Enter the 6-digit code we sent to your phone
              </p>
              <button 
                onClick={verifyOtp}
                className={`w-full rounded-full border border-solid transition-colors flex items-center justify-center gap-2 font-medium px-8 py-3
                  ${verificationInputs.join('').length === 6
                    ? 'bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] border-transparent'
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 border-transparent'
                  }`}
              >
                Verify Code
              </button>
              <p className="text-sm text-center font-[family-name:var(--font-geist-mono)] text-gray-600 dark:text-gray-400">
                Didn't receive the code? 
                <button 
                  onClick={() => handleSendVerificationCode()}
                  className="text-blue-500 hover:underline ml-1"
                >
                  Resend
                </button>
              </p>
              <NavigationButtons />
            </div>
          </div>
        </section>

        {/* Features Section
        <section id="features" className="h-screen flex items-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-8">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "AI Matching", desc: "Smart algorithms for better matches" },
                { title: "Privacy First", desc: "Your data is secure and protected" },
                { title: "Real Results", desc: "Proven success in matchmaking" },
              ].map((feature, i) => (
                <div key={i} className="p-6 border rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.06] transition-colors">
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="font-[family-name:var(--font-geist-mono)]">{feature.desc}</p>
                </div>
              ))}
            </div>
            <NavigationButtons />
          </div>
        </section> */}

        {/* Email Login Section */}
        <section id="email" className="h-screen flex items-center bg-black/[.05] dark:bg-white/[.06] p-4">
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Email</h2>
            <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
              <div className="flex gap-2">
                
                <button 
                  onClick={googleLogin}
                  className="flex-1 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] font-medium px-8 py-3"
                >
                  Login with google
                </button>
              </div>
              {/* <button 
                onClick={handleSendVerificationCode}
                disabled={!formData.phoneNumber || isCodeSent}
                className={`w-full rounded-full border border-solid transition-colors flex items-center justify-center gap-2 font-medium px-8 py-3
                  ${!formData.phoneNumber || isCodeSent
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400 border-transparent'
                    : 'bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] border-transparent'
                  }`}
              >
                {isCodeSent ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Code Sent
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button> */}
              {/* <p className="text-sm text-center font-[family-name:var(--font-geist-mono)] text-gray-600 dark:text-gray-400">
                We'll send you a verification code to get started
              </p> */}
              <NavigationButtons />
            </div>
          </div>
        </section>

        

        {/* User Info Section */}
        <section id="user-info" className="h-screen flex items-center p-4">
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Tell us about yourself</h2>
            <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-[family-name:var(--font-geist-mono)] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white dark:bg-black border font-[family-name:var(--font-geist-mono)] focus:border-2 focus:border-black dark:focus:border-white outline-none"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-[family-name:var(--font-geist-mono)] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-white dark:bg-black border font-[family-name:var(--font-geist-mono)] focus:border-2 focus:border-black dark:focus:border-white outline-none"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-[family-name:var(--font-geist-mono)] mb-2">
                  Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white dark:bg-black border font-[family-name:var(--font-geist-mono)] focus:border-2 focus:border-black dark:focus:border-white outline-none"
                  placeholder="Your age"
                />
              </div>

              <div>
                <label className="block text-sm font-[family-name:var(--font-geist-mono)] mb-2">
                  Gender
                </label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white dark:bg-black border font-[family-name:var(--font-geist-mono)] focus:border-2 focus:border-black dark:focus:border-white outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-[family-name:var(--font-geist-mono)] mb-2">
                  Sexual Orientation
                </label>
                <select 
                  value={formData.sexualOrientation}
                  onChange={(e) => setFormData(prev => ({ ...prev, sexualOrientation: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-white dark:bg-black border font-[family-name:var(--font-geist-mono)] focus:border-2 focus:border-black dark:focus:border-white outline-none"
                >
                  <option value="">Select orientation</option>
                  <option value="straight">Straight</option>
                  <option value="gay">Gay</option>
                  <option value="lesbian">Lesbian</option>
                  <option value="bisexual">Bisexual</option>
                  <option value="pansexual">Pansexual</option>
                  <option value="asexual">Asexual</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <p className="text-sm text-center font-[family-name:var(--font-geist-mono)] text-gray-600 dark:text-gray-400">
                All information is kept private and secure
              </p>

              <NavigationButtons />
            </div>
          </div>
        </section>

        {/* Personality Questions */}
        {['I gain energy from social gatherings and enjoy being the center of attention.',
          'I prefer spending time alone to recharge after social interactions.',
          'I focus on facts and details rather than ideas and theories.',
          'I enjoy interpreting abstract concepts and imagining future possibilities.',
          'I prioritize logic and objective analysis when making decisions.',
          "I consider people's feelings and values more than just facts when deciding.",
          'I prefer structured plans and sticking to schedules.',
          'I like to keep things open-ended and make decisions last-minute.',
          'I adapt quickly to change and enjoy spontaneity.',
          'I believe rules exist for a reason and should generally be followed.'
        ].map((question, index) => (
          <section 
            key={`mbti${index + 1}`} 
            id={`mbti${index + 1}`} 
            className="h-screen flex items-center bg-black/[.05] dark:bg-white/[.06] p-4"
          >
            <div className="w-full max-w-4xl mx-auto px-4">
              <h2 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">Personality Assessment</h2>
              
              <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
                <p className="text-lg sm:text-xl text-center font-[family-name:var(--font-geist-mono)]">
                  {index + 1}. {question}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between px-2 sm:px-4 text-xs sm:text-sm">
                    <span className="font-[family-name:var(--font-geist-mono)]">Strongly Disagree</span>
                    <span className="font-[family-name:var(--font-geist-mono)]">Strongly Agree</span>
                  </div>

                  <div className="flex justify-center gap-2 sm:gap-4">
                    {[1, 2, 3, 4, 5].map((number) => (
                      <button
                        key={number}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            personalityAnswers: prev.personalityAnswers.map((ans, idx) => 
                              idx === index ? number : ans
                            )
                          }));
                        }}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-solid 
                          transition-all duration-200 flex items-center justify-center 
                          text-base sm:text-lg font-bold focus:outline-none 
                          focus:ring-2 focus:ring-black dark:focus:ring-white group
                          ${formData.personalityAnswers[index] === number 
                            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' 
                            : 'hover:bg-black/[.05] dark:hover:bg-white/[.06] border-black/[.1] dark:border-white/[.1]'
                          }`}
                      >
                        <span className={`group-hover:scale-110 transition-transform
                          ${formData.personalityAnswers[index] === number 
                            ? 'transform scale-110' 
                            : ''
                          }`}>
                          {number}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center gap-2 sm:gap-4">
                    {[1, 2, 3, 4, 5].map((number) => (
                      <span key={number} className="w-14 sm:w-16 text-center text-xs font-[family-name:var(--font-geist-mono)] text-gray-600">
                        {number}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="font-[family-name:var(--font-geist-mono)] text-gray-600 dark:text-gray-400">
                    Question {index + 1} of 10
                  </p>
                  <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="h-1 bg-black dark:bg-white rounded-full" 
                      style={{ width: `${(index + 1) * 10}%` }}
                    ></div>
                  </div>
                </div>

                <NavigationButtons />
              </div>
        </div>
          </section>
        ))}

        {/* Face Preferences Section */}
        <section id="face-preferences" className="h-screen flex items-center bg-black/[.05] dark:bg-white/[.06] p-4">
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center">Select Your Type</h2>
            <p className="text-xs sm:text-sm text-center font-[family-name:var(--font-geist-mono)] mb-4 sm:mb-6 text-gray-600">
              Choose all the faces that you find attractive
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
              {/* Show opposite gender faces based on user's gender */}
              {(formData.gender === 'male' ? womenFaces : menFaces).map((imageName) => (
                <div 
                  key={imageName} 
                  className="relative aspect-square cursor-pointer group"
                  onClick={() => {
                    setSelectedFaces(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(imageName)) {
                        newSet.delete(imageName);
                      } else {
                        newSet.add(imageName);
                      }
                      return newSet;
                    });
                  }}
                >
                  <div className={`absolute inset-0 overflow-hidden rounded-lg transition-colors
                    ${selectedFaces.has(imageName) 
                      ? 'border-4 border-black dark:border-white' 
                      : 'border border-transparent hover:border-black dark:hover:border-white'
                    }`}>
                    <div className={`absolute top-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-black 
                      dark:border-white bg-white dark:bg-black transition-opacity z-10
                      ${selectedFaces.has(imageName) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm sm:text-base">✓</span>
                      </div>
                    </div>
          <Image
                      src={`/reference_faces/${imageName}`}
                      alt={imageName.split('/').pop().replace('.jpg', '').replace('.png', '').replace(/_/g, ' ')}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 150px"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm font-[family-name:var(--font-geist-mono)] text-gray-600 dark:text-gray-400 mb-1">
                Selected: <span className="font-bold">{selectedFaces.size}</span> faces
              </p>
              <p className="text-xs font-[family-name:var(--font-geist-mono)] text-gray-500">
                Click on images to select/deselect
              </p>
            </div>

            <NavigationButtons />
          </div>
        </section>

        {/* Selfie Upload Section */}
        <section id="selfie-upload" className="h-screen flex items-center bg-black/[.05] dark:bg-white/[.06] p-4">
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center">Add Your Photo</h2>
            <p className="text-xs sm:text-sm text-center font-[family-name:var(--font-geist-mono)] mb-4 sm:mb-6 text-gray-600 dark:text-gray-400">
              Upload a clear photo of your face or take a selfie
            </p>

            <div className="max-w-lg mx-auto space-y-6">
              {/* Preview Area */}
              <div className="aspect-square w-48 sm:w-64 mx-auto relative rounded-lg border-2 border-dashed border-black/20 dark:border-white/20 overflow-hidden">
                {selectedImage ? (
          <Image
                    src={selectedImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload/Camera Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setSelectedImage(url);
                        setFormData(prev => ({ ...prev, selfieImage: url }));
                        
                        // Automatically get face type after photo upload
                        try {
                          // Convert file to blob
                          const response = await fetch(url);
                          const blob = await response.blob();
                          
                          // Create file from blob
                          const imageFile = new File([blob], "selfie.jpg", { type: "image/jpeg" });
                          
                          const formData = new FormData();
                          formData.append("file", imageFile);
                      
                          const res = await fetch("http://192.168.68.75:8000/classify-selfie", {
                            method: "POST",
                            body: formData,
                          });
                      
                          const data = await res.json();
                          console.log("Face Type:", data);
                          setFormData(prev => ({
                            ...prev,
                            userFaceType: data
                          }));
                      
                        } catch (error) {
                          console.error("Error classifying face:", error);
                          alert("Failed to analyze face type. Please try again.");
                        }
                      }
                    }}
                  />
                  <div className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] font-medium px-8 py-3 text-sm sm:text-base gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Photo
                  </div>
                </label>

                {/* <button 
                  onClick={startCamera}
                  className="flex-1 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] font-medium px-8 py-3 text-sm sm:text-base gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Take Selfie
                </button> */}
              </div>

              <p className="text-xs text-center font-[family-name:var(--font-geist-mono)] text-gray-500">
                Choose a clear, well-lit photo of your face
              </p>
            </div>

            <NavigationButtons />
          </div>
        </section>

        <div id="recaptcha-container" style={{ display: "none" }} />

        {/* Contact Section */}
        <section id="submit" className="h-screen flex items-center bg-black/[.05] dark:bg-white/[.06] p-4 relative">
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center">Thank You!</h2>
            <p className="text-xs sm:text-sm text-center font-[family-name:var(--font-geist-mono)] mb-4 sm:mb-6 text-gray-600 dark:text-gray-400">
              Leave us a message and we'll get back to you
            </p>
            <button 
              onClick={handleSubmit}
              className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium px-8 py-3 text-sm sm:text-base"
            >
              Submit
            </button>
            <button 
              onClick={handleMatch}
              className="w-full rounded-full mt-3 border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium px-8 py-3 text-sm sm:text-base"
            >
              Match
            </button>

            {/* Modal */}
            {showModal && (
              <div 
                className="absolute inset-0 bg-black/[.05] dark:bg-white/[.06] backdrop-blur-sm flex items-center justify-center"
                onClick={() => !isLoading && setShowModal(false)}
              >
                <div 
                  className="bg-white dark:bg-black rounded-2xl p-8 max-w-lg w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isLoading ? (
                    <>
                      <div className="w-8 h-8 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
                      <p className="text-sm font-[family-name:var(--font-geist-mono)]">Processing...</p>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-center mb-4">Your Matches</h3>
                      {matchResults.map((match, index) => {
                        const distance = userLocation && match.location ? 
                          calculateDistance(
                            userLocation.lat, 
                            userLocation.lng, 
                            match.location.lat, 
                            match.location.lng
                          ) : null;

                        const bearing = userLocation && match.location ? 
                          calculateBearing(
                            userLocation.lat, 
                            userLocation.lng, 
                            match.location.lat, 
                            match.location.lng
                          ) : null;

                        return (
                          <div key={index} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold">{match.name}</h4>
                              <span className="text-sm bg-black/[.05] dark:bg-white/[.06] px-2 py-1 rounded-full">
                                {match.matchScore}% Match
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p>MBTI: {match.mbti}</p>
                              <p>Age: {match.age}</p>
                              {distance && (
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    <svg 
                                      className="w-4 h-4" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    <span>{distance} km away</span>
                                  </div>
                                  {bearing !== null && (
                                    <div className="flex items-center gap-2">
                                      <DirectionArrow bearing={bearing} compass={compass} />
                                      <div className="text-xs text-gray-500">
                                        {compass ? 'Live direction' : 'No compass data'}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {!userLocation && (
                        <div className="text-center text-sm text-gray-500 mt-4">
                          Enable location services to see distance and directions
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Location and Direction Section */}
        <section id="location-direction" className="h-screen flex items-center bg-black/[.05] dark:bg-white/[.06] p-4">
          <div className="w-full max-w-4xl mx-auto px-4">
            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center">Find Your Matches</h2>
            <p className="text-xs sm:text-sm text-center font-[family-name:var(--font-geist-mono)] mb-4 sm:mb-6 text-gray-600 dark:text-gray-400">
              See how close your matches are and which direction to go
            </p>

            <div className="max-w-lg mx-auto space-y-6">
              {matchResults.length > 0 ? (
                <div className="space-y-6">
                  {matchResults.map((match, index) => {
                    const distance = userLocation && match.location ? 
                      calculateDistance(
                        userLocation.lat, 
                        userLocation.lng, 
                        match.location.lat, 
                        match.location.lng
                      ) : null;

                    const bearing = userLocation && match.location ? 
                      calculateBearing(
                        userLocation.lat, 
                        userLocation.lng, 
                        match.location.lat, 
                        match.location.lng
                      ) : null;

                    return (
                      <div key={index} className="bg-white dark:bg-black rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold">{match.name}</h4>
                          <span className="text-sm bg-black/[.05] dark:bg-white/[.06] px-2 py-1 rounded-full">
                            {match.matchScore}% Match
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>MBTI: {match.mbti}</p>
                          <p>Age: {match.age}</p>
                          {distance && (
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <svg 
                                  className="w-4 h-4" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span>{distance} km away</span>
                              </div>
                              {bearing !== null && (
                                <div className="flex items-center gap-2">
                                  <DirectionArrow bearing={bearing} compass={compass} />
                                  <div className="text-xs text-gray-500">
                                    {compass ? 'Live direction' : 'No compass data'}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No matches found yet</p>
                  <button 
                    onClick={handleMatch}
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium px-8 py-3 mx-auto"
                  >
                    Find Matches
                  </button>
                </div>
              )}

              {locationStatus === 'error' && (
                <div className="text-center text-red-500 text-sm mt-4">
                  Please enable location services to see distances and directions
                </div>
              )}

              {compassStatus === 'error' && (
                <div className="text-center text-yellow-500 text-sm mt-2">
                  Compass not available on your device
                </div>
              )}
            </div>

            <NavigationButtons />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-2 sm:py-4 border-t bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm sm:text-base font-[family-name:var(--font-geist-mono)]">
          <p>© 2024 AI Matchmaker. All rights reserved.</p>
        </div>
      </footer>

      {/* Add the camera modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-2xl p-4 max-w-lg w-full mx-4">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  transform: 'scaleX(-1)',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={stopCamera}
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] font-medium px-6 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={takePhoto}
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium px-6 py-2 text-sm"
              >
                Take Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add some CSS for the mirrored video */}
      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
