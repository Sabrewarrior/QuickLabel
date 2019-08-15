Installation: 
    
    Install node.js and npm
    Download or clone repository
    npm install
    
Run:

    For standalone application (electron based):
        npm run start-electron
    For browser:
        Create settings.json file based on settings_example.json
        npm run start
        Open browser to localhost:3000

Data file: 

    First column (id): Only rows with number format will be added. Repeat ids if there is additional data for same id.
    Second column (data): Data is assumed to be in text format.
    
Map file:

    The following input types are allowed
    "checkbox":	Checkbox list
    "color": Color picker
    "date":	Date control (year, month, day (no time))
    "datetime-local": Date and time control (year, month, day, time (no timezone))
    "email": Field for an e-mail address
    "month": Month and year control (no timezone)
    "number": Defines a field for entering a number
    "password":	Password field
    "radio": Radio button list
    "tel":	Field for entering a telephone number
    "text":	Single-line text field
    "time":	Control for entering a time (no timezone)
    "url":	Field for entering a URL
   