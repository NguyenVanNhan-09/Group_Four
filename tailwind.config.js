/** @type {import('tailwindcss').Config} */
module.exports = {
   content: ["./src/**/*.{html,js}"],
   theme: {
      extend: {
         screens: {
           xs: "475px"
         },
         fontFamily: {
            roboto: ["Roboto", "sans-serif"],
         },
         colors: {
            primary: "#38bdf8",
            textPrimary: "#303030",
            textPlaceholder: "#7C7C7C",
         },
         screens: {
            xs: "475px",
         },
         boxShadow: {
            custom: "0px 12px 33px -8px rgba(121,197,239,1)",
         },
         animation: {
            notification: "notification .6s ease-in-out",
         },
         keyframes: {
            notification: {
               "0%": {
                  top: "-100%",
               },
               "100%": {
                  top: "1rem",
               },
            },
         }
      },
   },
   plugins: [],
};
