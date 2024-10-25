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
      },
   },
   plugins: [],
};
