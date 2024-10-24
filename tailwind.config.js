/** @type {import('tailwindcss').Config} */
module.exports = {
   content: ["./src/**/*.{html,js}"],
   theme: {
      extend: {
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
      },
   },
   plugins: [],
};
