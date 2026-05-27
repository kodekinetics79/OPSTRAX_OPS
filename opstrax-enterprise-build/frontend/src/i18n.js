import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
const resources = {
  en: {
    translation: {
      landing: {
        homeHeader: "Étérnel Experiences",
        homeTitle: "Discover Your Path to Complete Relaxation",
        homePara:
          " Where the art of touch meets the science of healing — experience wellness  redefined.",
        homeBtn: "Book Now",

        // headercomponent
        signUp: "Signup",
        logIn: "Login",

        // Experiences & Packages

        expHeader: "Explore Our Signature Experiences & Packages",
        expparaOne:
          "Each journey begins with a single touch. Choose from our carefully designed experiences — available as single sessions or bundled in exclusive wellness packages.",
        // expparaTwo:
        //   "available as single sessions or bundled in exclusive wellness packages.",
        // buttons
        experiencesbtn: "Experiences",
        pakageBtn: "Packages",
        // pakages
        // pakage1
        pakage1Name: "RESET - BEACH VIBE-RATION",
        pakage1Description:
          "An immersive 4-hand massage designed to harmonize your body, mind, and energy.",
        pakage1Price: "130",
        pakage1benefitTime: "90 minutes",
        pakage1benefitDesc: "Duration",
        pakage1benefitHands: "four-hand",
        pakage1benefitInstructors: "2 Instructors",
        pakage1btn: "Book Now",

        // pakage2
        pakage2Name: "RECHARGE - BEACH SUN-SATION",
        pakage2Description:
          "A restorative 4-hand therapy designed for deep muscle relief and total recovery.",
        pakage2Price: "130",
        pakage2benefitTime: "90 minutes",
        pakage2benefitDesc: "Duration",
        pakage2benefitHands: "four-hand",
        pakage2benefitInstructors: "2 Instructors",
        pakage2btn: "Book Now",

        // pakage3
        pakage3Name: "RECOVER - BEACH REST-ORATION",
        pakage3Description:
          "Traditional healing with warm sand to soothe tension and ground your energy.",
        pakage3Price: "130",
        pakage3benefitTime: "90 minutes",
        pakage3benefitDesc: "Duration",
        pakage3benefitHands: "two-hand",
        pakage3benefitInstructors: "01 Instructors",
        pakage3btn: "Book Now",

        // meetOurteam
        teamHeader: "Meet Our Team",
        teamTitle: "Hands that Heal. Hearts that Care.",
        teamPara:
          "Our certified wellness experts combine experience, intuition, and genuine care to create a transformative journey for each client.",

        card1designation: "Registered Massage Therapist",
        card1Name: "Maria Baiocco",
        card1Detail:
          "With a lifelong passion for health, sports, art and nature, Maria Baiocco has always been guided by a deep curiosity for what makes us truly well....",

        card2designation: "Qualified Massage Therapist",
        card2Name: "Nayara Arnoud",
        card2Detail:
          "Since a young age, Nayara Arnoud has felt a deep calling to care for others. Her natural sensitivity and connection to people's bodies, emotions...",

        card3designation: "Massage Therapist",
        card3Name: "Wendy",
        card3Detail:
          "to take care of others, in the best way possible, using my hands and my heart. This duo led me to massage therapy, first in France and now...",

        teamBtn: "Read More",

        // whyChooseUs
        chooseUsHeader: "Why Choose Us",
        chooseUsTitle: "Only the Best, Especially for You",
        chooseUsPara:
          "We select only the finest products and employ the most methods to ensure that what you receive isn’t just good—it’s the best.",
        // card1
        chooseUsCard1Heading: "Peaceful Setting",
        chooseUsCard1Text:
          "A serene setting that promotes healing and relaxation.",
        // card2
        chooseUsCard2Heading: "Active Care After Treatment",
        chooseUsCard2Text:
          "We ensure lasting relief through active follow-up care.",
        // card3
        chooseUsCard3Heading: "Safety Protocol",
        chooseUsCard3Text:
          "Strict adherence to safety protocols ensures a clean, safe, and secure environment.",
        // card4
        chooseUsCard4Heading: "High Client Retention Rate",
        chooseUsCard4Text:
          "Our high client retention rate shows how well our treatments work.",
        // card5
        chooseUsCard5Heading: "Supportive and Welcoming Staff",
        chooseUsCard5Text:
          "Our staff is not only skilled; they're also caring and friendly.",
        // card6
        chooseUsCard6Heading: "Soothing Interior Design",
        chooseUsCard6Text:
          "Our facility features soothing interior designs that calm the mind.",

        // Testimonial
        testimonialHeader: "Testimonial",
        testimonialTitle: "What Our Guests Say",
        testimonialPara:
          "Real stories from clients who found balance, renewal, and peace through the Éternel touch.",

        // footer
        footerHeader: "Begin Your Éternel Journey Today",
        footerTitle:
          "Book your personalized experience or explore our exclusive packages designed for lasting wellness.",
        footerPara:
          "Our expertly formulated oils enhance every interaction, enriching moments of laughter and love with a luxurious touch. Perfect for massage or daily enjoyment, these oils promise to nourish the skin and uplift the spirit.",
        footerContact: "Contact",
        footerBtn1:"Book a Session",
        footerBtn2:"Explore Packages",
      },
      dashboard: {
        heading: "Dashboard",
        revenueAndSales: "Revenue & Sales",
        singleSessions: "Single Sessions",
        packages: "Packages",
        addOns: "Add-Ons",
        upcomingOff: "Upcoming Off",
        instructorPerformance: "Instructor Performance",
        bookingActivity: "Booking Activity",
        viewAll: "View All",
        menu: {
          dashboard: "Dashboard",
          platform: "Platform",
          bookings: "Bookings",
          team: "My Team",
          services: "Services & Packages",
          coupons: "Coupons",
          customers: "Customers",
        },
        stats: {
          bookings: "Bookings",
          revenue: "Revenue",
          users: "Users",
          coupons: "Coupons",
          activeBookings: "Active Bookings",
          totalMonthlyRevenue: "Total Monthly Revenue",
          activePackageHolders: "Active Package Holders",
          activePromotions: "Active Promotions",
        },
        table: {
          date: "Date",
          type: "Type",
          label: "Label",
          affectedInstructors: "Affected Instructors",

          bookingId: "Booking ID",
          user: "User",
          service: "Service",
          instructors: "Instructor(s)",
          dateTime: "Date & Time",
          status: "Status",
        },
        status: {
          pending: "Pending",
          confirmed: "Confirmed",
          approved: "Approved",
          completed: "Completed",
          cancelled: "Cancelled",
          rejected: "Rejected",
          suspended: "Suspended",
          pendingrenewal: "PendingRenewal",
          reschedulereq: "Reschedule Req",
          active: "Active",
          draft: "Draft",
          published: "Published",
          scheduled: "Scheduled",
          upcoming: "Upcoming",
        },
      },
      bookings: {
        bookingsText: "Bookings",
        bookingListText: "Booking List",
        upcomingBookings: "Upcoming Bookings",
        rejectedBookings: "Rejected Bookings",
        bookingListTitles: {
          refid: "Ref ID",
          clientsDetails: "Clients Details",
          service: "Service",
          duration: "Duration",
          hands: "Hands",
          instructor: "Instructor(s)",
          price: "Price",
          status: "Status",
        },
      },
      platform: {
        heading: "Platform Management",
        tabs: {
          workingHours: "Working Hours",
          timeOff: "Time Off",
          breaks: "Breaks",
        },

        workingHours: {
          title: "Working Hours & Buffer Settings",

          timezone: {
            label: "Platform Time Zone",
            toronto: "(GMT -5) Toronto / Eastern Time",
            losAngeles: "(GMT -8) Los Angeles / Pacific Time",
            london: "(GMT +0) London / GMT",
          },

          hours: {
            label: "Working Hours",
            applyAll: "Apply to all days",
          },

          buffer: {
            label: "Session Buffer Time",
            options: {
              min15: "15 min",
              min30: "30 min",
              min45: "45 min",
              min60: "60 min",
            },
          },

          actions: {
            cancel: "Cancel",
            save: "Save Changes",
          },

          days: {
            monday: "Monday",
            tuesday: "Tuesday",
            wednesday: "Wednesday",
            thursday: "Thursday",
            friday: "Friday",
            saturday: "Saturday",
            sunday: "Sunday",
          },
        },
        timeOff: {
          title: "Manage Time Off",

          form: {
            titleLabel: "Title",
            titlePlaceholder: "Type a Title",

            startDate: "Start Date",
            endDate: "End Date",

            allDay: "All Day",

            repeat: {
              none: "Does not repeat",
              daily: "Daily",
              weekly: "Weekly",
              monthly: "Monthly",
            },

            addButton: "Add",
          },

          list: {
            durationDay: "1 Day",
          },
        },
        breaks: {
          title: "Manage Breaks",
        },
      },
      servicesAndPackages: {
        heading: "Services & Packages",
        services: "Services",
        packages: "Packages",
        addon: "Add-On",
        feedbackAndReviews: "Feedback & Reviews",
        reportingAndAnalytics: "Reporting & Analytics",
        addNewService: "Add New Service",
        addNewPackages: "Add New Packages",
        addAddon:"Add Add-On"
      },
      serviceForm: {
        createServiceHeading: "Create New Service",
        editServiceHeading: "Edit Service",
        serviceNameLabel: "Service Name",
        descriptionLabel: "Description",
        handTypeLabel: "Hand Type",
        durationLabel: "Duration",
        priceLabel: "Price",
        publicLabel: "Public",
        promoTagLabel: "Promotional Tag & Benefits (optional)",
        uploadImagesLabel: "Upload Hero Images",
        uploadImageButton: "Upload Image",
        serviceNamePlaceholder: "Enter Service Name",
        descriptionPlaceholder: "Enter Description",
        handTypePlaceholder: "Select Hand Type",
        durationPlaceholder: "Select Duration",
        pricePlaceholder: "Enter Price",
        promoTagPlaceholder: "Enter Promotional Tag & Benefits",
        cancelButton: "Cancel",
        addServiceButton: "Add New Service",
        updateServiceButton: "Update Service",
      },
      packageForm: {
        createPackageHeading: "Create New Package",
        editPackageHeading: "Edit Package",
        serviceLabel: "Service",
        servicePlaceholder: "Select Service",
        packageNameLabel: "Package Name",
        packageNamePlaceholder: "Enter Package Name",
        priceLabel: "Price",
        pricePlaceholder: "Enter Price",
        noOfSessionsLabel: "Number of Sessions",
        noOfSessionsPlaceholder: "Enter Number of Sessions",
        bonusLabel: "Bonus (optional)",
        bonusPlaceholder: "Enter Bonus Details",
        digitalProductLabel: "Digital Product (optional)",
        digitalProductPlaceholder: "Enter Digital Product",
        cancelButton: "Cancel",
        addPackageButton: "Add New Package",
        updatePackageButton: "Update Package",
      },
      formEmail: "Email:",
      formPassword: "Password:",
      formConfirmPassword: "Confirm Password:",
      formName: "Name:",
      forgotPassword: "Forgot Password",
      remember: "Remember me",

      forgetPassword: {
        heading: "Reset Your Password",
        subHeading: "No worries — it happens.",
        text: "Enter your registered email address and we’ll send you a link to reset your password and get you back to relaxation.",
        btnText: "Send Email",
        successMessage: "Password reset link has been sent to your email.",
        successDescription: "Please check your email and follow the instructions to reset your password.",
      },
      login: {
        heading: "Welcome Back",
        subHeading: "Relaxation is just a click away.",
        text: "Log in to book your next massage session, manage your packages, and enjoy a seamless wellness journey.",
        btnText: "Login",
        accountText: "Don't have an account?",
        login: "Signup",
      },
      resetPassword: {
        heading: "Reset Your Password",
        subHeading: "Create a new secure password",
        text: "Enter and confirm your new password below to continue your wellness journey.",
        btnText: "Reset Password",
      },
      verifyOtp: {
        heading: "Verify Your Identity",
        subHeading: "Check your email for the code",
        text: "Enter the 6-digit code we sent to your email to verify your identity and continue.",
        btnText: "Verify",
        fieldVerifyOtp: "Verify OTP:",
      },
      signup: {
        heading: " Create Your Account",
        subHeading: "Begin your Journey with Eternal Experience.",
        text: "Sign up to explore premium massage services, purchase session packages, and personalize your relaxation with add-ons.",
        btnText: "Create Account",
        accountText: "Already have an account?",
        login: "Login",
        orLogin: "Or login with",
      },
      bookings: {
        bookingsText: "Bookings",
        bookingListText: "Booking List",
        upcomingBookings: "Upcoming Bookings",
        rejectedBookings: "Rejected Bookings",
        bookingListTitles: {
          refid: "Ref ID",
          clientsDetails: "Clients Details",
          service: "Service",
          duration: "Duration",
          hands: "Hands",
          instructor: "Instructor(s)",
          price: "Price",
          status: "Status",
        },
      },
      customers: {
        accountManagement: "Account Management",
        tabs: {
          platform: "Platform",
          instructor: "Instructor",
        },
        platform: {
          tabs: {
            customers: "Customers",
            multiSession: "Multi Session",
            paymentTracking: "Payment Tracking",
            notification: "Notification",
          },
          userRecords: "UserRecords",
          userRecordsListTitles: {
            customerId: "Customer ID",
            nameAndEmail: "Name & Email",
            contactNo: "Contact No",
            totalBookings: "Total Bookings",
            amountSpent: "Amount Spent",
            status: "Status",
          },
          multiSessionListTitles: {
            customerId: "Customer ID",
            nameAndEmail: "Customer Name & Email",
            service: "Service",
            package: "Package",
            sessionsUsed: "Sessions Used",
            amountSpent: "Amount Spent",
            status: "Status",
          },
          paymentTrackingListTitles: {
            customerId: "CustomerID",
            userName: "User Name",
            date: "Date",
            serviceOrPackage: "Service/Package",
            amount: "Amount",
            paymentType: "Payment Type",
            status: "Status",
          },
          notificatioListTitles: {
            notificationType: "Notification Type",
            push: "Push",
          },
        },
        instructor: {
          tabs: {
            roleManagement: "Role Management",
            noticesAndUpdates: "Notices And Updates",
          },
          roleManagementListTitles: {
            customerId: "Customer Id",
            nameAndEmail: "Name And Email",
            temporaryLogin: "Temporary Login",
            accessLevel: "Access Level",
            status: "Status",
          },
          noticeAndUpdatesListTitles: {
            customerId: "Customer Id",
            title: "Title",
            priority: "Priority",
            decription: "Decription",
            visiblityPeriod: "Visiblity Period",
            audience: "Audience",
            attachments: "Attachments",
            status: "Status",
          },
        },
      },
      instuctor: {
        menu: {
          dashboard: "Dashboard",
          bookings: "Bookings",
          availabilityManagement: "Availability Management",
          noticesAndUpdates: "Notices & Updates",
          profileManagement: "Profile Management",
        },
        bookingList: {
          heading: "Booking List",
          lables: {
            bookingId: "Booking ID",
            clientsDetails: "Clients Details",
            service: "Service",
            dateTime: "Date Time",
            durationAndHands: "Duration & Hands",
            instructor: "Instructor(s)",
            status: "Status",
          },
        },
        availabilityManagement: {
          tabs: {
            workingHours: "Working Hours",
            timeOf: "Time Of",
          },
          workingHoursList: {
            heading: "Working Hours",
            date: "Date",
            day: "Day",
            workingHours: "Working Hours",
            breaks: "Breaks",
            totalHoursWorked: "Total Hours Worked",
          },
          timeOfList: {
            heading: "Time Of",
            date: "Date",
            day: "Day",
            reason: "Reason",
            status: "Status",
          },
        },
      },
      user: {
        menu: {
          dashboard: "Dashboard",
          shop: "Shop",
          myPackages: "My Packages",
          myBookings: "My Bookings",
        },
      },
    },
  },

  fr: {
    translation: {
      landing: {
        homeHeader: "Expériences d'été",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
