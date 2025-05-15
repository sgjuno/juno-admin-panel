# Example 1
{
  "_id": {
    "$oid": "6791098e859115bcbd6886f0"
  },
  "pocName": "James",
  "pocContact": "+44-23423432",
  "type": "BROKER",
  "website": "www.positivecommercial.com",
  "companyName": "Positive Commercial Finance",
  "companyNumber": 233432843,
  "address": "Street 4, Buckingham Palace, London, UK",
  "country": "United Kingdom",
  "isActive": true,
  "onboardedAt": 1729154816,
  "carFinanceDomain": false,
  "propertyFinanceDomain": true,
  "smeFinanceDomain": false,
  "clientCode": "POSITIVECOMMERCIAL",
  "ruleCriteria": {
    "minimumCompanyAge": {
      "minimumAge": 1
    },
    "loanAmountRequired": {
      "lowerBound": 5000,
      "upperBound": 5000000
    }
  },
  "detailsRequired": [
    {
      "category": "loanType",
      "detailRequired": [
        {
          "datapoint": "loanAmountRequired",
          "id": "loanAmountRequired",
          "prev": null
        },
        {
          "datapoint": "loanType",
          "id": "loanType",
          "prev": null,
          "questionText": "What type of loan is this: purchase or refinance?",
          "next_anyway": [
            "typeOfProperty",
            "securityPropertyAddress"
          ],
          "options": {
            "purchase": "purchasePrice",
            "refinance": "existingMortgageAmount"
          }
        },
        {
          "datapoint": "enquiryType",
          "id": "enquiryType",
          "prev": null,
          "questionText": "What type of funding are you enquiring about? For example, bridging, development",
          "options": [
            "bridging finance loan",
            "development finance loan",
            "joint venture finance loan",
            "mortgage finance loan"
          ],
          "extract_only": true
        },
        {
          "datapoint": "purchasePrice",
          "id": "purchasePrice",
          "prev": "loanType",
          "questionText": "What is the purchase price?"
        },
        {
          "datapoint": "existingMortgageAmount",
          "id": "existingMortgageAmount",
          "prev": "loanType",
          "questionText": "What is the existing mortgage amount?"
        },
        {
          "datapoint": "estimatedPropertyValue",
          "id": "estimatedPropertyValue",
          "prev": null
        },
        {
          "datapoint": "loanTerm",
          "id": "loanTerm",
          "prev": null,
          "questionText": "What is the length of the term required?",
          "branchingRule": {
            "2 years or less": "exitStrategy"
          },
          "next_anyway": [
            "adverseCreditLast3Years"
          ]
        },
        {
          "datapoint": "exitStrategy",
          "id": "exitStrategy",
          "prev": "loanTerm",
          "questionText": "What is the exit strategy?"
        },
        {
          "datapoint": "applicationType",
          "id": "applicationType",
          "prev": null,
          "questionText": "Is the application type company or personal?",
          "next_anyway": [
            "planningConsent",
            "willBePropertyWorks"
          ],
          "options": {
            "company": [
              "companyName",
              "companyNumber"
            ],
            "personal": ""
          }
        }
      ]
    },
    {
      "category": "companyDetails",
      "detailRequired": [
        {
          "datapoint": "companyName",
          "id": "companyName",
          "prev": "applicationType",
          "questionText": "What is the name of the company?"
        },
        {
          "datapoint": "companyNumber",
          "id": "companyNumber",
          "prev": "applicationType",
          "questionText": "What is the company number?"
        }
      ]
    },
    {
      "category": "leadApplicantDetails",
      "detailRequired": [
        {
          "datapoint": "leadApplicantTitle",
          "id": "leadApplicantTitle",
          "prev": "planningConsent",
          "questionText": "What is the lead applicant's title?",
          "options": [
            "Mr.",
            "Ms."
          ]
        },
        {
          "datapoint": "leadApplicantName",
          "id": "leadApplicantName",
          "prev": "planningConsent",
          "questionText": "What is the lead applicant's name?"
        },
        {
          "datapoint": "leadApplicantDob",
          "id": "leadApplicantDob",
          "prev": "planningConsent",
          "questionText": "What is the lead applicant's date of birth?"
        },
        {
          "datapoint": "leadApplicantNationality",
          "id": "leadApplicantNationality",
          "prev": "willBePropertyWorks",
          "questionText": "What is the lead applicant's nationality?"
        },
        {
          "datapoint": "leadApplicantEmail",
          "id": "leadApplicantEmail",
          "prev": null,
          "questionText": "What is the lead applicant's email?"
        },
        {
          "datapoint": "leadApplicantPhoneNumber",
          "id": "leadApplicantPhoneNumber",
          "prev": "willBePropertyWorks",
          "questionText": "What is the lead applicant's phone number?"
        },
        {
          "datapoint": "leadApplicantSecondPhoneNumber",
          "id": "leadApplicantSecondPhoneNumber",
          "prev": null,
          "questionText": "What is the lead applicant's second phone number?",
          "extract_only": true
        },
        {
          "datapoint": "leadApplicantCurrentAddress",
          "id": "leadApplicantCurrentAddress",
          "prev": "willBePropertyWorks",
          "questionText": "What is the lead applicant's current address?"
        },
        {
          "datapoint": "leadApplicantHomeowner",
          "id": "leadApplicantHomeowner",
          "prev": "securityPropertyAddress",
          "questionText": "Is the lead applicant a homeowner?"
        },
        {
          "datapoint": "adverseCreditLast3Years",
          "id": "adverseCreditLast3Years",
          "prev": "loanTerm",
          "questionText": "Has adverse credit been registered in the last 3 years?",
          "options": {
            "yes": "adverseCreditDetails",
            "no": ""
          },
          "next_anyway": [
            "tenure"
          ]
        },
        {
          "datapoint": "adverseCreditDetails",
          "id": "adverseCreditDetails",
          "prev": "adverseCreditLast3Years",
          "questionText": "Please provide details of the adverse credit."
        }
      ]
    },
    {
      "category": "securityDetails",
      "detailRequired": [
        {
          "datapoint": "securityPropertyAddress",
          "id": "securityPropertyAddress",
          "prev": "loanType",
          "questionText": "What is the security property address?",
          "next_anyway": [
            "leadApplicantHomeowner"
          ]
        },
        {
          "datapoint": "typeOfProperty",
          "id": "typeOfProperty",
          "prev": "loanType",
          "questionText": "What type of property is it? E.g. residential, commercial, cleared site, etc.",
          "branchingRule": {
            "is property commercial": [
              "propertyUsage"
            ],
            "property is apartment blocks or office and NOT a cleared site": [
              "numberOfStoreys"
            ]
          }
        },
        {
          "datapoint": "propertyUsage",
          "id": "propertyUsage",
          "prev": "typeOfProperty",
          "questionText": "What is the property currently used for?"
        },
        {
          "datapoint": "numberOfStoreys",
          "id": "numberOfStoreys",
          "prev": "typeOfProperty",
          "questionText": "How many storeys does the property have?"
        },
        {
          "datapoint": "tenure",
          "id": "tenure",
          "prev": "adverseCreditLast3Years",
          "questionText": "What is the tenure: leasehold or freehold?",
          "options": {
            "leasehold": "remainingTermOfLease",
            "freehold": null
          }
        },
        {
          "datapoint": "remainingTermOfLease",
          "id": "remainingTermOfLease",
          "prev": "tenure",
          "questionText": "What is the remaining term of the lease?"
        },
        {
          "datapoint": "planningConsent",
          "id": "planningConsent",
          "prev": "applicationType",
          "questionText": "Do you intend to apply for any planning consents?",
          "options": [
            "yes",
            "no"
          ],
          "next_anyway": [
            "leadApplicantTitle",
            "leadApplicantName",
            "leadApplicantDob"
          ]
        },
        {
          "datapoint": "willBePropertyWorks",
          "id": "willBePropertyWorks",
          "prev": "applicationType",
          "questionText": "Will you be carrying out any works to the property?",
          "next_anyway": [
            "leadApplicantPhoneNumber",
            "leadApplicantCurrentAddress",
            "leadApplicantNationality"
          ],
          "options": {
            "yes": "refurbishmentCosts",
            "no": ""
          }
        },
        {
          "datapoint": "refurbishmentCosts",
          "id": "refurbishmentCosts",
          "prev": "willBePropertyWorks",
          "questionText": "What are the estimated costs for the works to be carried out?"
        }
      ]
    }
  ],
  "adminEmail": [
    "jordan@thisisjuno.ai",
    "somanshu@thisisjuno.ai",
    "abhinav@thisisjuno.ai"
  ],
  "unified": {
    "messaging": "67374e35a032b4faea401fe6",
    "crm": [
      {
        "app": "Hubspot",
        "connectionId": "6706b8ab6d390bb9bc4f125d",
        "isActive": false,
        "updatedDate": 1728551895
      },
      {
        "app": "Pipedrive",
        "connectionId": "67174d4540ba1d31c25cca25",
        "isActive": true,
        "updatedDate": 1728551897,
        "apiKey": "140eb597155c8bce81bacc513d061b5d11814f1e"
      },
      {
        "app": "Salesforce",
        "connectionId": "6706b8ab6d390bb9bc4f125r",
        "isActive": false,
        "updatedDate": 1728551897
      },
      {
        "app": "Zoho",
        "connectionId": "67122a83b3b88a929d430d95",
        "isActive": false,
        "updatedDate": 1728551897
      }
    ]
  },
  "enquireEmail": "thisisjuno.dev.5@gmail.com",
  "emailAction": "SEND",
  "emailDomain": "positivecommercial.com",
  "custom_fields": [
    {
      "custom_field_name": "Date of Birth",
      "normilized_field_name": "Date of Birth",
      "custom_field_id": "7e04d831432e4c2031f09a6108fb1a5b9fe74faa"
    },
    {
      "custom_field_name": "Homeowner Status",
      "normilized_field_name": "Homeowner Status",
      "custom_field_id": "8e43f167864d681f64f6ce55b89020803cd7c947"
    },
    {
      "custom_field_name": "Nationality",
      "normilized_field_name": "Nationality",
      "custom_field_id": "71f7f7076cbf9252b28f1a30eac7f1162e7de669"
    },
    {
      "custom_field_name": "Months at Current Address",
      "normilized_field_name": "Months at Current Address",
      "custom_field_id": "9c881da90fe7dad4d7c927e1678e5341abb00301"
    },
    {
      "custom_field_name": "SIC Code",
      "normilized_field_name": "sic_code_1",
      "custom_field_id": "1e243f0b924b29800eac426c2d2b3ae7aa0be72c"
    },
    {
      "custom_field_name": "Company Status",
      "normilized_field_name": "Company Status",
      "custom_field_id": "8292e8a8c8161fee9d4d52c07969302dd40834c1"
    },
    {
      "custom_field_name": "Number of Directors",
      "normilized_field_name": "number_of_directors",
      "custom_field_id": "3ce5f78408ee86d18b57bbe1bb70afd08c35f389"
    },
    {
      "custom_field_name": "Test Field",
      "normilized_field_name": "Test Field",
      "custom_field_id": "65fd3c658a204de77e2e11a7358e893b1fbc67b4"
    }
  ],
  "responsePrompts": {
    "generalCase": "You are a friendly and professional email-writing assistant for a ${clientType} business called ${clientName}.\n        A potential customer or their representative has sent an email with some details of a loan enquiry/quote, but some of the enquiry data may be missing. Your job is to reply to request the missing information in case.\n        You will receive a JSON object containing the email body of the latest email, some information about the customer, and a list of data that is missing from a customer's loan enquiry as 'questions' in the JSON object with value/answer/response as null.\n        Please write an email politely requesting the missing information. List the missing information and their descriptions in the format of bullet list (separate item for each datapoint).\n        Before listing you can say \"To enable us to provide you with a quote...\" or something appropriate like this.\n        If an 'invalidDatapoints' value exists for a data point, DO include the FULL explanation why the provided datapoint was incomplete, when you list the missing information. The customer should understand why provided information was invalid and what they should provide. Start with \"Provided ...\"\n\n        If the object contains a queryResponse object with a value, you MUST include this in your response. This is an answer to the customer's query.\n        IMPORTANT: Do NOT make a reference to answering the query, for example \"in answer to the query...\". Simply provide the answer without acknowledging that it's the answer to a query.\n        If no query_response object is present in the JSON object, DO NOT reference a query or answer any questions.\n\n        Do NOT add a subject line.\n\n        Do NOT call the customer by title, if it isn't filled in the datapoints.\n\n        Do NOT invent any rules or restrictions.\n\n        DO NOT use word \"application\", since it is enquiry or quote.\n\n        Provide a short summary of the enquiry containing ALL given datapoints in the format of vertical table where rows are datapoint name and its value.\n\n        All monetary amounts are in GBP (£).\n\n        Write the email in HTML format. Do not include newline characters (\\n, \\r) or unescaped quotation marks (\") in the email; these will throw syntax errors.\n\n        Write your email so when it renders, it starts like this:\n\n        Hello,\n        <content>\n\n\n        Write your email so when it renders, it ends like this:\n\n        Best wishes,\n        ${clientName}\n\n        DON'T FORGET TO WRITE THE EMAIL IN HTML AND ALSO BEAUTIFY IT (PROFESSIONALLY ONLY) TO ENHANCE THE READABILITY LIKE MAKING HEADINGS OR IMPORTANT POINTS BOLD AND DENOTING FIGURES OR COMPARISON IF REQUIRED IN TABULAR STRUCTURE.\n\n        Your output should be a structured JSON object in the following format:\n        {\n          \"response\": \"<html email here>\"\n        }",
    "noNextQuestionsCase": "You are a friendly and professional email-writing assistant for a ${clientType} business called ${clientName}.\n    A potential customer or their representative has sent an email with a possible query after filling-in the information for enquiry/quote. Your job is to reply stating obtained information, and shortly thank for providing the infomation.\n    You will receive a JSON object containing the email body of the latest email, some information about the customer in the JSON object.\n    Please write an email politely.\n\n    DO NOT use queryResponse object and DO NOT ask anything.\n\n    Do NOT add a subject line.\n\n    Do NOT call the customer by title, if it isn't filled in the datapoints.\n\n    DO NOT use word \"application\", since it is enquiry or quote.\n\n    Provide a short summary of the enquiry containing ALL given datapoints in the format of vertical table where rows are datapoint name and its value.\n\n    All monetary amounts are in GBP (£).\n\n    When thanking, write: \"Thank you for the information provided. We will contact you as soon as we process the application.\"\n\n    Write the email in HTML format. Do not include newline characters (\\\\n, \\\\r) or unescaped quotation marks (\") in the email; these will throw syntax errors.\n\n    Write your email so when it renders, it starts like this:\n\n    Hello,\n    <content>\n\n\n    Write your email so when it renders, it ends like this:\n\n    Best wishes,\n    ${clientName}\n\n    DON'T FORGET TO WRITE THE EMAIL IN HTML AND ALSO BEAUTIFY IT (PROFESSIONALLY ONLY) TO ENHANCE THE READABILITY LIKE MAKING HEADINGS OR IMPORTANT POINTS BOLD AND DENOTING FIGURES OR COMPARISON IF REQUIRED IN TABULAR STRUCTURE.\n\n    Your output should be a structured JSON object in the following format:\n    {\n     \"response\": \"<html email here>\"\n    }",
    "irrelevantCase": "Hello,\nThank you for your enquiry! One of our team members will evaluate it and respond to you as soon as possible.\n\nBest regards,\n${clientName}"
  },
  "formEmail": [
    "somanshu@thisisjuno.ai",
    "leads@mailer.acquirz.co.uk"
  ],
  "nylasGrantId": "b07bd757-bee9-4d01-a8d9-d972bf55dcd2",
  "followUpConfig": {
    "isActive": true,
    "configType": "FLAT",
    "flatGapInterval": [
      1,
      2,
      3,
      4
    ],
    "noOfFollowUps": 4
  },
  "irrelevancyConfig": {}
}

#Example 2
{
  "_id": {
    "$oid": "6793849bf6e59530dcd7e171"
  },
  "pocName": "Danny Girnun",
  "pocContact": "",
  "type": "LENDER",
  "website": "https://momentafinance.co.uk/",
  "companyName": "Momenta Finance",
  "companyNumber": "04504897",
  "address": "New Derwent House, 69-73 Theobalds Road, London, England, WC1X 8TA",
  "country": "United Kingdom",
  "isActive": true,
  "onboardedAt": {
    "$numberLong": "1737472509458"
  },
  "createdAt": {
    "$numberLong": "1737472509458"
  },
  "updatedAt": {
    "$numberLong": "1737472509458"
  },
  "carFinanceDomain": false,
  "propertyFinanceDomain": false,
  "smeFinanceDomain": true,
  "clientCode": "MOMENTA",
  "ruleCriteria": {
    "loanAmount": {
      "lowerBound": 50000,
      "upperBound": 1500000
    },
    "minimumCompanyAge": {
      "minimumAge": 2
    },
    "loanTerm": {
      "upperBound": 72,
      "lowerBound": 1
    },
    "annualRevenue": {
      "lowerBound": 350000
    },
    "companyType": [
      "ltd",
      "llp"
    ],
    "residentialStatus": [
      "homeowner"
    ],
    "applicantIsDirector": true,
    "mostRevenueFromUk": true,
    "llpHasLtdPartner": true,
    "companyRegisteredInUk": true,
    "leadApplicantCCJsSettled": true,
    "loanPurposeBasedInUk": true,
    "securityNotResidentialAddress": true,
    "interestOnlyPeriod": {
      "upperBound": 12,
      "lowerBound": 0
    }
  },
  "adminEmail": [
    "tech@thisisjuno.ai",
    "arpit@thisisjuno.ai",
    "abhishek@thisisjuno.ai"
  ],
  "unified": {
    "messaging": "",
    "crm": [
      {
        "app": "Pipedrive",
        "connectionId": "679ca68e47fe78df398554c8",
        "isActive": false,
        "updatedAt": 1738319707,
        "apiKey": "3acab342c5eab60a4dd842fcf8ec4eea8822e462"
      },
      {
        "app": "Salesforce",
        "connectionId": "67bf6caf57a51bb8c1a9e217",
        "isActive": false,
        "updatedAt": "1738319707",
        "apiKey": null
      },
      {
        "app": "Salesforce",
        "connectionId": "67d984a8e71c169238d36f15",
        "isActive": true,
        "updatedAt": "1738319707",
        "apiKey": null
      }
    ]
  },
  "enquireEmail": "thisisjuno.dev.4@gmail.com",
  "emailDomain": "gmail.com",
  "responsePrompts": {
    "generalCase": "You are a friendly and professional email-writing assistant for a ${clientType} business called ${clientName}.\n        A potential customer or their representative has sent an email with some details of a loan application, but some of the application data may be missing. Your job is to reply to request the missing information in case.\n        You will receive a JSON object containing the email body of the latest email, some information about the applicant, and a list of data that is missing from a customer's loan application as 'questions' in the JSON object with value/answer/response as null.\n        Please write an email politely requesting the missing information. List the missing information and their descriptions in the format of bullet list (separate item for each datapoint).\n\n\t**Instructions**:\n       -  If an 'invalidDatapoints' value exists for a data point, DO include the explanation why the provided datapoint was incomplete, when you list the missing information. Start with \"Provided ...\"\n        - If the object contains a ‘queryResponse’ object with a value, you MUST include this in your response, but so that it would be coherent. This is an answer to the applicant's query.\n        IMPORTANT: Do NOT make a reference to answering the query, for example \"in answer to the query...\". Simply provide the answer without acknowledging that it's the answer to a query.\n        - If no query_response object is present in the JSON object, DO NOT reference a query or answer any questions.\n        - If an `Eligibility Criteria` object exists, advise the applicant that the details of their application may need to be discussed further for the outlined reasons, and then list the reasons within the \"Eligibility Criteria\" object.\n        - Do NOT add a subject line.\n\n        - Do NOT call the applicant by title, if it isn't filled in the datapoints.\n\n        - Do NOT invent any rules or restrictions.\n\n        - Provide a short summary of the application so far containing ALL given datapoints in the form of vertical table.\n\n        - All monetary amounts are in GBP (£).\n\n        - Write the email in HTML format. Do not include newline characters (\\n, \\r) or unescaped quotation marks (\") in the email; these will throw syntax errors.\n\n\t**Structure**:\n\t- Greetings/Thanks for reaching out.\n\t- Answer to the customer’s question if any (‘queryResponse’ object with a value is present).\n\t- Summary of application so far, listing all the datapoints currently extracted in the form of vertical table.\n\t- Request for missing data.\n\n        Write your email so when it renders, it starts like this:\n\n        Hello,\n        <content>\n\n\n        And ends like this:\n\n        Best wishes,\n        ${clientName}\n\n\t\n\tIMPORTANT: The whole email should be coherent and logically connected.\n\n\n        DON'T FORGET TO WRITE THE EMAIL IN HTML AND ALSO BEAUTIFY IT (PROFESSIONALLY ONLY) TO ENHANCE THE READABILITY LIKE MAKING HEADINGS OR IMPORTANT POINTS BOLD AND DENOTING FIGURES OR COMPARISON IF REQUIRED IN TABULAR STRUCTURE.\n\n        Your output should be a structured JSON object in the following format:\n        {\n          \"response\": \"<html email here>\"\n        }",
    "noNextQuestionsCase": "You are a friendly and professional email-writing assistant for a ${clientType} business called ${clientName}.\\n    A potential customer or their representative has sent an email with a possible query after filling-in the application. Your job is to reply stating obtained information, shortly thank for filling-in the application and answer query if there are some. \\n    You will receive a JSON object containing the email body of the latest email, some information about the applicant in the JSON object.\\n    Please write an email politely.\\n\\n    If the object contains a queryResponse object with a value, you MUST include this in your response. This is an answer to the applicant's query.\\n    IMPORTANT: Do NOT make a reference to answering the query, for example \\\"in answer to the query...\\\". Simply provide the answer without acknowledging that it's the answer to a query.\\n    If no queryResponse object is present in the JSON object, DO NOT reference a query or answer any questions.\\n\\n    Do NOT add a subject line.\\n\\n    Do NOT call the applicant by title, if it isn't filled in the datapoints.\\n\\n    Provide a short summary of the application containing ALL given datapoints in the format of table.\\n\\n    All monetary amounts are in GBP (£).\\n    \\n    When thanking at the end, write: \\\"Thank you for the information provided. We will contact you as soon as we process the application.\\\"\\n\\n    Write the email in HTML format. Do not include newline characters (\\\\\\\\n, \\\\\\\\r) or unescaped quotation marks (\\\") in the email; these will throw syntax errors.\\n\\n    Write your email so when it renders, it starts like this:\\n\\n    Hello,\\n    <content>\\n\\n\\n    Write your email so when it renders, it ends like this:\\n\\n    Best wishes,\\n    ${clientName}\\n\\n    DON'T FORGET TO WRITE THE EMAIL IN HTML AND ALSO BEAUTIFY IT (PROFESSIONALLY ONLY) TO ENHANCE THE READABILITY LIKE MAKING HEADINGS OR IMPORTANT POINTS BOLD AND DENOTING FIGURES OR COMPARISON IF REQUIRED IN TABULAR STRUCTURE.\\n\\n    Your output should be a structured JSON object in the following format:\\n    {\\n     \\\"response\\\": \\\"<html email here>\\\"\\n    }",
    "irrelevantCase": "Hello,\nThank you for your enquiry! One of our team members will evaluate it and respond to you as soon as possible.\n\nBest regards,\n${clientName}"
  },
  "nylasGrantId": "4179e5b4-ac56-4016-b99b-c7128097762b",
  "emailAction": "SEND",
  "followUpConfig": {
    "isActive": false,
    "configType": "FLAT",
    "flatGapInterval": [
      1,
      1,
      1
    ],
    "noOfFollowUps": 3
  },
  "vectorDbParams": {
    "RagContextDocCount": 5,
    "pineconeApiKey": "pcsk_4AmRsk_NZhwu8SDqbhHGZSRkzpxZ4wVL7CjpeMXZmP5hHA1tJRkvVD4D8gN9srWjmrka3X",
    "pineconeIndexName": "momenta-ada"
  },
  "feature_flags": {
    "ntropyProcessing": false,
    "directorSearch": true,
    "openBanking": false,
    "bypassBusinessAccNameValidation": true,
    "propertyEnrichment": true,
    "saveEmailBody": false,
    "bankStatements": true,
    "decisionEngineCall": true
  },
  "detailsRequired": [
    {
      "category": "pscDetails",
      "detailRequired": [
        {
          "datapoint": "numberOfPscs",
          "id": "numberOfPscs",
          "prev": null,
          "extract_externally": true,
          "options": {
            "1": [
              "psc1Dob",
              "psc1CurrentAddress"
            ],
            "2": [
              "psc1Dob",
              "psc1CurrentAddress",
              "psc2Dob",
              "psc2CurrentAddress"
            ],
            "3": [
              "psc1Dob",
              "psc1CurrentAddress",
              "psc2Dob",
              "psc2CurrentAddress",
              "psc3Dob",
              "psc3CurrentAddress"
            ],
            "4": [
              "psc1Dob",
              "psc1CurrentAddress",
              "psc2Dob",
              "psc2CurrentAddress",
              "psc3Dob",
              "psc3CurrentAddress",
              "psc4Dob",
              "psc4CurrentAddress"
            ],
            "5": [
              "psc1Dob",
              "psc1CurrentAddress",
              "psc2Dob",
              "psc2CurrentAddress",
              "psc3Dob",
              "psc3CurrentAddress",
              "psc4Dob",
              "psc4CurrentAddress",
              "psc5Dob",
              "psc5CurrentAddress"
            ]
          }
        }
      ]
    },
    {
      "category": "psc1Details",
      "detailRequired": [
        {
          "datapoint": "psc1Name",
          "id": "psc1Name",
          "prev": null,
          "extract_externally": true
        },
        {
          "datapoint": "psc1Dob",
          "id": "psc1Dob",
          "prev": "numberOfPscs"
        },
        {
          "datapoint": "psc1CurrentAddress",
          "id": "psc1CurrentAddress",
          "prev": "numberOfPscs"
        }
      ]
    },
    {
      "category": "psc2Details",
      "detailRequired": [
        {
          "datapoint": "psc2Name",
          "id": "psc2Name",
          "prev": null,
          "extract_externally": true
        },
        {
          "datapoint": "psc2Dob",
          "id": "psc2Dob",
          "prev": "numberOfPscs"
        },
        {
          "datapoint": "psc2CurrentAddress",
          "id": "psc2CurrentAddress",
          "prev": "numberOfPscs"
        }
      ]
    },
    {
      "category": "psc3Details",
      "detailRequired": [
        {
          "datapoint": "psc3Name",
          "id": "psc3Name",
          "prev": null,
          "extract_externally": true
        },
        {
          "datapoint": "psc3Dob",
          "id": "psc3Dob",
          "prev": "numberOfPscs"
        },
        {
          "datapoint": "psc3CurrentAddress",
          "id": "psc3CurrentAddress",
          "prev": "numberOfPscs"
        }
      ]
    },
    {
      "category": "psc4Details",
      "detailRequired": [
        {
          "datapoint": "psc4Name",
          "id": "psc4Name",
          "prev": null,
          "extract_externally": true
        },
        {
          "datapoint": "psc4Dob",
          "id": "psc4Dob",
          "prev": "numberOfPscs"
        },
        {
          "datapoint": "psc4CurrentAddress",
          "id": "psc4CurrentAddress",
          "prev": "numberOfPscs"
        }
      ]
    },
    {
      "category": "psc5Details",
      "detailRequired": [
        {
          "datapoint": "psc5Name",
          "id": "psc5Name",
          "prev": null,
          "extract_externally": true
        },
        {
          "datapoint": "psc5Dob",
          "id": "psc5Dob",
          "prev": "numberOfPscs"
        },
        {
          "datapoint": "psc5CurrentAddress",
          "id": "psc5CurrentAddress",
          "prev": "numberOfPscs"
        }
      ]
    },
    {
      "category": "loanType",
      "detailRequired": [
        {
          "datapoint": "enquirySource",
          "id": "enquirySource",
          "prev": null,
          "questionText": "Are you the one who needs the loan (direct) or applying on behalf of someone else (introducer)?",
          "options": {
            "direct": "",
            "introducer": "brokerEmailAddress"
          },
          "extract_only": true,
          "default_value": "direct"
        },
        {
          "datapoint": "loanAmountRequired",
          "id": "loanAmountRequired",
          "prev": null
        },
        {
          "datapoint": "loanPurpose",
          "id": "loanPurpose",
          "prev": null,
          "questionText": "The reason why the applicant is applying for a loan, and what they are going to use the money for: business acquisition, refurbishment, bridge finance, etc.",
          "options": [
            "Asset finance",
            "Buy stock",
            "Business acquisition",
            "Expansion / growth",
            "Commercial mortgage",
            "Refinancing a loan",
            "Bridge finance",
            "Refurbishment",
            "Tax bill",
            "Working capital",
            "Development exit funding"
          ]
        },
        {
          "datapoint": "loanPurposeBasedInUk",
          "id": "loanPurposeBasedInUk",
          "prev": null,
          "questionText": "Is the loan going to be used for business concerns solely within the UK?",
          "default_value": "yes (assumed)",
          "options": [
            "yes",
            "no"
          ]
        },
        {
          "datapoint": "loanTerm",
          "id": "loanTerm",
          "prev": null,
          "questionText": "The length of time the applicant would like to borrow for."
        },
        {
          "datapoint": "loanType",
          "id": "loanType",
          "prev": null,
          "questionText": "The type of loan the applicant wishes to apply for: Unsecured/Secured business loan / MCA / Property Development",
          "options": [
            "Business Loan - Unsecured",
            "Business Loan - Secured",
            "MCA - Unsecured",
            "Property Development"
          ]
        },
        {
          "datapoint": "additionalSecurity",
          "id": "additionalSecurity",
          "prev": null,
          "questionText": "Whether or not additional security is available for this loan, and if so, what type of security"
        },
        {
          "datapoint": "interestOnlyPeriod",
          "id": "interestOnlyPeriod",
          "prev": null,
          "default_value": "0",
          "extract_only": true
        }
      ]
    },
    {
      "category": "companyDetails",
      "detailRequired": [
        {
          "datapoint": "companyNumber",
          "id": "companyNumber",
          "prev": null,
          "questionText": "The UK company number belonging to the applicant's company"
        },
        {
          "datapoint": "companyName",
          "id": "companyName",
          "prev": null,
          "questionText": "The name of the applicant's company"
        },
        {
          "datapoint": "companyTradingName",
          "id": "companyTradingName",
          "prev": null,
          "questionText": "The trading name of the applicant's company",
          "default_from_datapoint": "companyName",
          "extract_only": true
        },
        {
          "datapoint": "companyTradingAddress",
          "id": "companyTradingAddress",
          "prev": null,
          "questionText": "The trading address of the applicant's company",
          "default_from_datapoint": "companyRegisteredAddress",
          "extract_only": true
        },
        {
          "datapoint": "companyRegisteredAddress",
          "id": "companyRegisteredAddress",
          "prev": null,
          "questionText": "The registered address of the applicant's company",
          "extract_only": true
        },
        {
          "datapoint": "companyType",
          "id": "companyType",
          "prev": null,
          "branchingRule": {
            "company type is llp": "companyHasLtdPartner"
          }
        },
        {
          "datapoint": "companyHasLtdPartner",
          "id": "companyHasLtdPartner",
          "prev": "companyType",
          "options": [
            "yes",
            "no"
          ]
        },
        {
          "datapoint": "natureOfBusiness",
          "id": "natureOfBusiness",
          "prev": null
        },
        {
          "datapoint": "companyIndustry",
          "id": "companyIndustry",
          "prev": null
        },
        {
          "datapoint": "companyAnnualRevenue",
          "id": "companyAnnualRevenue",
          "prev": null,
          "questionText": "The applicant's company's current annual revenue in GBP"
        },
        {
          "datapoint": "companyRevenueMostlyFromUk",
          "id": "companyRevenueMostlyFromUk",
          "prev": null,
          "options": [
            "yes",
            "no"
          ]
        },
        {
          "datapoint": "companyRegisteredInUk",
          "id": "companyRegisteredInUk",
          "prev": "companyName",
          "options": [
            "yes",
            "no"
          ],
          "default_value": "yes (assumed)"
        },
        {
          "datapoint": "companyDirectorsHaveCCJs",
          "id": "companyDirectorsHaveCCJs",
          "prev": null,
          "questionText": "do any company directors have CCJs against them?",
          "options": {
            "yes": "companyDirectorsCCJSettled",
            "no": ""
          }
        },
        {
          "datapoint": "companyDirectorsCCJSettled",
          "id": "companyDirectorsCCJSettled",
          "prev": "companyDirectorsHaveCCJs",
          "questionText": "Are the CCJs settled?",
          "options": [
            "yes",
            "no"
          ]
        }
      ]
    },
    {
      "category": "brokerDetails",
      "detailRequired": [
        {
          "datapoint": "brokerName",
          "id": "brokerName",
          "prev": null
        },
        {
          "datapoint": "brokerEmailAddress",
          "id": "brokerEmailAddress",
          "prev": "enquirySource",
          "extract_only": true
        }
      ]
    },
    {
      "category": "decisionDetails",
      "detailRequired": [
        {
          "datapoint": "isApplicantApproved",
          "id": "isApplicantApproved",
          "prev": null,
          "options": {
            "true": [],
            "false": []
          },
          "extract_externally": true
        }
      ]
    },
    {
      "category": "securityDetails",
      "detailRequired": [
        {
          "datapoint": "additionalSecurity",
          "id": "additionalSecurity",
          "prev": null,
          "questionText": "Will you be providing security for this loan?",
          "extract_only": true,
          "options": {
            "yes": [
              "provideSecurityDetails"
            ],
            "no": []
          }
        },
        {
          "datapoint": "provideSecurityDetails",
          "id": "provideSecurityDetails",
          "prev": "additionalSecurity",
          "questionText": "What type of security will you be providing? For example, a property, assets, etc.",
          "options": {
            "property": [
              "securityPropertyAddress",
              "estimatedSecurityPropertyValue",
              "securityExistingMortgageAmount"
            ],
            "other": []
          }
        },
        {
          "datapoint": "securityPropertyAddress",
          "id": "securityPropertyAddress",
          "prev": "provideSecurityDetails",
          "questionText": "What is the address of the property you will be providing as security?"
        },
        {
          "datapoint": "estimatedSecurityPropertyValue",
          "id": "estimatedPropertyValue",
          "prev": "provideSecurityDetails",
          "questionText": "What is the estimated value of the property you will be providing as security?"
        },
        {
          "datapoint": "securityExistingMortgageAmount",
          "id": "existingMortgageAmount",
          "prev": "provideSecurityDetails",
          "questionText": "What is the current outstanding mortgage amount on the property, if any?",
          "branchingRule": {
            "existing mortgage amount is greater than zero": "securityExistingLender"
          }
        },
        {
          "datapoint": "securityExistingLender",
          "id": "existingLender",
          "prev": "securityExistingMortgageAmount",
          "questionText": "Who is the current lender for the mortgage on the security property?"
        },
        {
          "datapoint": "securityMonthlyRepaymentAmount",
          "id": "monthlyRepaymentAmount",
          "prev": "securityExistingMortgageAmount",
          "questionText": "What is the monthly repayment amount for the mortgage on the security property?"
        },
        {
          "datapoint": "isSecuritySameAsResidentialAddress",
          "id": "isSecuritySameAsResidentialAddress",
          "prev": "securityPropertyAddress",
          "questionText": "Is the security property the same as the applicant's residential address?",
          "options": [
            "yes",
            "no"
          ]
        }
      ]
    }
  ],
  "requiredDocuments": [
    "bankStatement"
  ],
  "bankStatementValidationConfig": {
    "validDateRangeInMonth": "3",
    "excludedBankNames": [
      "Royal Bank of Scotland"
    ]
  },
  "formEmail": [
    "arpit@thisisjuno.ai"
  ],
  "communicationMode": {
    "isSMSEnabled": false,
    "isWhatsappEnabled": false,
    "isEmailEnabled": true
  }
}

#Example 3
{
  "_id": {
    "$oid": "67cadb3c2bc49d546dc6f5d5"
  },
  "pocName": "Saurabh Shah",
  "pocContact": "800 124 0166",
  "type": "BROKER",
  "website": "https://www.daraltamleek.com/",
  "companyName": "Dar Al Tamleek",
  "companyNumber": "-",
  "address": "Jeddah, Al Khalidiyyah 23422, Al Mukmal Tower, 7th floor",
  "country": "Saudi Arabia",
  "isActive": true,
  "onboardedAt": {
    "$numberLong": "1741347644684"
  },
  "createdAt": {
    "$numberLong": "1741347644684"
  },
  "updatedAt": {
    "$numberLong": "1741347644684"
  },
  "carFinanceDomain": false,
  "propertyFinanceDomain": true,
  "smeFinanceDomain": false,
  "clientCode": "DARALTAMLEEK",
  "ruleCriteria": {},
  "detailsRequired": [
    {
      "category": "loanType",
      "detailRequired": [
        {
          "datapoint": "buyToLet",
          "id": "buyToLet",
          "prev": null
        },
        {
          "datapoint": "isFirstHome",
          "id": "isFirstHome",
          "prev": null,
          "questionText": "Is this your first property purchase?"
        },
        {
          "datapoint": "loanAmountRequired",
          "id": "loanAmountRequired",
          "prev": null,
          "questionText": "Do you know how much you're looking to borrow? If so, how much?"
        },
        {
          "datapoint": "depositAmount",
          "id": "depositAmount",
          "prev": null,
          "questionText": "How much will you use as a deposit?"
        },
        {
          "datapoint": "loanTerm",
          "id": "loanTerm",
          "prev": null,
          "questionText": "How long would you like to borrow for?",
          "extract_only": true,
          "default_value": "35 years (assumed as default)"
        },
        {
          "datapoint": "numberOfApplicants",
          "id": "numberOfApplicants",
          "prev": null,
          "branchingRule": {
            "1 applicant": [
              "leadApplicantEmploymentStatus",
              "leadApplicantOutstandingLoanAmount",
              "leadApplicantOtherSignificantExpenses"
            ],
            "2 applicants": [
              "leadApplicantEmploymentStatus",
              "leadApplicantOutstandingLoanAmount",
              "leadApplicantOtherSignificantExpenses",
              "secondApplicantEmploymentStatus",
              "secondApplicantOutstandingLoanAmount",
              "secondApplicantOtherSignificantExpenses"
            ],
            "3 or more applicants": ""
          }
        }
      ]
    },
    {
      "category": "leadApplicantDetails",
      "detailRequired": [
        {
          "datapoint": "leadApplicantName",
          "id": "leadApplicantName",
          "prev": null,
          "questionText": "What is the lead applicant's name?"
        },
        {
          "datapoint": "leadApplicantEmail",
          "id": "leadApplicantEmail",
          "prev": null,
          "questionText": "What is the lead applicant's email?"
        },
        {
          "datapoint": "leadApplicantPhoneNumber",
          "id": "leadApplicantPhoneNumber",
          "prev": null,
          "questionText": "What is the lead applicant's phone number?"
        },
        {
          "datapoint": "leadApplicantEmploymentStatus",
          "id": "leadApplicantEmploymentStatus",
          "prev": null,
          "questionText": "Is the lead applicant employed, self-employed, retired or not working?",
          "options": {
            "employed": "leadApplicantBasicIncome",
            "self-employed": "leadApplicantAverageIncome",
            "retired": "",
            "not working": ""
          }
        },
        {
          "datapoint": "leadApplicantBasicIncome",
          "id": "leadApplicantBasicIncome",
          "prev": null,
          "questionText": "How much is the lead applicant's basic annual income?"
        },
        {
          "datapoint": "leadApplicantAverageIncome",
          "id": "leadApplicantAverageIncome",
          "prev": "leadApplicantEmploymentStatus",
          "questionText": "What has the lead applicant's average annual income been over the last two years?"
        },
        {
          "datapoint": "leadApplicantNumberOfDependants",
          "id": "leadApplicantNumberOfDependants",
          "prev": null,
          "questionText": "How many financial dependants does the lead applicant have?"
        },
        {
          "datapoint": "leadApplicantOutstandingLoanAmount",
          "id": "leadApplicantOutstandingLoanAmount",
          "prev": null,
          "questionText": "Does the lead applicant have any outstanding loans? If so, how much? This includes credit card and debts"
        },
        {
          "datapoint": "leadApplicantOtherSignificantExpenses",
          "id": "leadApplicantOtherSignificantExpenses",
          "prev": null,
          "questionText": "Does the lead applicant have any other significant expenses? If so, how much? This does not include rent"
        }
      ]
    },
    {
      "category": "secondApplicantDetails",
      "detailRequired": [
        {
          "datapoint": "secondApplicantEmploymentStatus",
          "id": "secondApplicantEmploymentStatus",
          "prev": "numberOfApplicants",
          "questionText": "Is the second applicant employed, self-employed, retired or not working?",
          "options": {
            "employed": "secondApplicantBasicIncome",
            "self-employed": "secondApplicantAverageIncome",
            "retired": "",
            "not working": ""
          }
        },
        {
          "datapoint": "secondApplicantBasicIncome",
          "id": "secondApplicantBasicIncome",
          "prev": "secondApplicantEmploymentStatus",
          "questionText": "How much is the second applicant's basic annual income?"
        },
        {
          "datapoint": "secondApplicantAverageIncome",
          "id": "secondApplicantAverageIncome",
          "prev": "secondApplicantEmploymentStatus",
          "questionText": "What has the second applicant's average annual income been over the last two years?"
        },
        {
          "datapoint": "secondApplicantNumberOfDependants",
          "id": "secondApplicantNumberOfDependants",
          "prev": "numberOfApplicants",
          "questionText": "How many financial dependants does the second applicant have?"
        },
        {
          "datapoint": "secondApplicantOutstandingLoanAmount",
          "id": "secondApplicantOutstandingLoanAmount",
          "prev": "numberOfApplicants",
          "questionText": "Does the second applicant have any outstanding loans? If so, how much? This includes credit card and debts"
        },
        {
          "datapoint": "secondApplicantOtherSignificantExpenses",
          "id": "secondApplicantOtherSignificantExpenses",
          "prev": "numberOfApplicants",
          "questionText": "Do you have any other significant expenses? If so, how much? This does not include rent"
        }
      ]
    }
  ],
  "adminEmail": [
    "tech@thisisjuno.ai",
    "jordan@thisisjuno.ai"
  ],
  "unified": {
    "messaging": "",
    "crm": []
  },
  "enquireEmail": "bkp3_thisisjuno.dev.3@gmail.com",
  "emailDomain": "daraltamleek.sa",
  "responsePrompts": {
    "generalCase": "You are a friendly and professional email-writing assistant for a ${clientType} business called ${clientName}.\n        A potential customer or their representative has sent an email with some details of a loan application, but some of the application data may be missing. Your job is to reply to request the missing information in case.\n        You will receive a JSON object containing the email body of the latest email, some information about the applicant, and a list of data that is missing from a customer's loan application as 'questions' in the JSON object with value/answer/response as null.\n        Please write an email politely requesting the missing information. List the missing information and their descriptions in the format of bullet list (separate item for each datapoint).\n\n\t**Instructions**:\n       -  If an 'invalidDatapoints' value exists for a data point, DO include the explanation why the provided datapoint was incomplete, when you list the missing information. Start with \"Provided ...\"\n        - If the object contains a ‘queryResponse’ object with a value, you MUST include this in your response, but so that it would be coherent. This is an answer to the applicant's query.\n        IMPORTANT: Do NOT make a reference to answering the query, for example \"in answer to the query...\". Simply provide the answer without acknowledging that it's the answer to a query.\n        - If no query_response object is present in the JSON object, DO NOT reference a query or answer any questions.\n\n        - Do NOT add a subject line.\n\n        - Do NOT call the applicant by title, if it isn't filled in the datapoints.\n\n        - Do NOT invent any rules or restrictions.\n\n        - Provide a short summary of the application so far containing ALL given datapoints in the form of vertical table.\n\n        - All monetary amounts are in SAR.\n\n        - Write the email in HTML format. Do not include newline characters (\\n, \\r) or unescaped quotation marks (\") in the email; these will throw syntax errors.\n\n\t**Structure**:\n\t- Greetings/Thanks for reaching out.\n\t- Answer to the customer’s question if any (‘queryResponse’ object with a value is present).\n\t- Summary of application so far, listing all the datapoints currently extracted in the form of vertical table.\n\t- Request for missing data.\n\n        Write your email so when it renders, it starts like this:\n\n        Hello,\n        <content>\n\n\n        And ends like this:\n\n        Best wishes,\n        ${clientName}\n\n\t\n\tIMPORTANT: The whole email should be coherent and logically connected.\n\n\n        DON'T FORGET TO WRITE THE EMAIL IN HTML AND ALSO BEAUTIFY IT (PROFESSIONALLY ONLY) TO ENHANCE THE READABILITY LIKE MAKING HEADINGS OR IMPORTANT POINTS BOLD AND DENOTING FIGURES OR COMPARISON IF REQUIRED IN TABULAR STRUCTURE.\n\n        Your output should be a structured JSON object in the following format:\n        {\n          \"response\": \"<html email here>\"\n        }",
    "noNextQuestionsCase": "You are a friendly and professional email-writing assistant for a ${clientType} business called ${clientName}.\n    A potential customer or their representative has sent an email with a possible query after filling-in the application. Your job is to reply stating obtained information, shortly thank for filling-in the application and answer query if there are some.\n    You will receive a JSON object containing the email body of the latest email, some information about the applicant in the JSON object.\n    Please write an email politely.\n\n    If the object contains a queryResponse object with a value, you MUST include this in your response. This is an answer to the applicant's query.\n    IMPORTANT: Do NOT make a reference to answering the query, for example \"in answer to the query...\". Simply provide the answer without acknowledging that it's the answer to a query.\n    If no queryResponse object is present in the JSON object, DO NOT reference a query or answer any questions.\n\n    If \"Conclusion\" section is provided, it means that based on provided data, there is no mortgage available. You should say the conclusion and say that maybe they need to decrease requested loan amount.\n\n    If \"Additional Calculated datapoints\" section is given, create additional table with summary so far for this data. Say that it is a mortage-related values we calculated.\n\n    At the end send the customer to the link leading to ${clientName}'s application form '${clientFormUrl}' to fill the rest of application. Provide them with the exact link\n\n    Do NOT add a subject line.\n\n    Do NOT call the applicant by title, if it isn't filled in the datapoints.\n\n    Provide a short summary of the application containing ALL given datapoints in the format of table.\n\n    All monetary amounts are in SAR.\n\n    When thanking at the end, write: \"Thank you for the information provided. We will contact you as soon as we process the application.\"\n\n    Write the email in HTML format. Do not include newline characters (\\\\n, \\\\r) or unescaped quotation marks (\") in the email; these will throw syntax errors.\n\n    Write your email so when it renders, it starts like this:\n\n    Hello,\n    <content>\n\n\n    Write your email so when it renders, it ends like this:\n\n    Best wishes,\n    ${clientName}\n\n    DON'T FORGET TO WRITE THE EMAIL IN HTML AND ALSO BEAUTIFY IT (PROFESSIONALLY ONLY) TO ENHANCE THE READABILITY LIKE MAKING HEADINGS OR IMPORTANT POINTS BOLD AND DENOTING FIGURES OR COMPARISON IF REQUIRED IN TABULAR STRUCTURE.\n\n    Your output should be a structured JSON object in the following format:\n    {\n     \"response\": \"<html email here>\"\n    }",
    "irrelevantCase": "Hello,\nThank you for your enquiry! One of our team members will evaluate it and respond to you as soon as possible.\n\nBest regards,\n${clientName}"
  },
  "sendDocuments": [],
  "nylasGrantId": "bkp3_55c9cb0c-9f31-4752-9955-7a29b20148d3",
  "emailAction": "SEND",
  "pandaDoc": {
    "docTemplates": [
      {
        "docName": "GDPR Form",
        "templateId": "Fomy3JPenpzdiksFhh6kGj"
      }
    ]
  },
  "followUpConfig": {
    "isActive": true,
    "configType": "FLAT",
    "flatGapInterval": [
      1,
      1,
      1,
      1
    ],
    "noOfFollowUps": 4
  },
  "mortgageCalculatorVars": {
    "annual_interest_rate": 3.5,
    "lti_multipliers": {
      "first_time_buyer_high_income_limit": 50000,
      "first_time_buyer_high_income_low_ltv": 4.3,
      "first_time_buyer_high_income_high_ltv": 5.2,
      "first_time_buyer_ltv_limit": 90,
      "default": 4
    },
    "max_income_to_mortgage_ratio": 0.35
  },
  "vectorDbParams": {
    "RagContextDocCount": 5,
    "pineconeApiKey": "",
    "pineconeIndexName": ""
  },
  "feature_flags": {
    "ntropyProcessing": false,
    "directorSearch": true
  }
}

#Example 4
{
  "_id": {
    "$oid": "67d2acea2029cd254ffb79e3"
  },
  "pocName": "Christian Brough",
  "pocContact": "0345 6461801",
  "type": "LENDER",
  "website": "https://haydockfinance.co.uk/",
  "companyName": "Haydock Finance",
  "companyNumber": "01526882",
  "address": "Haydock Finance Ltd, Challenge House, Challenge Way, Blackburn, Lancashire, BB1 5QB",
  "country": "United Kingdom",
  "isActive": true,
  "onboardedAt": {
    "$numberLong": "1741860074645"
  },
  "createdAt": {
    "$numberLong": "1741860074645"
  },
  "updatedAt": {
    "$numberLong": "1741860074645"
  },
  "carFinanceDomain": false,
  "propertyFinanceDomain": true,
  "smeFinanceDomain": false,
  "clientCode": "HAYDOCK",
  "ruleCriteria": {
    "loanAmount": {
      "lowerBound": 5000,
      "upperBound": 5000000
    },
    "minimumCompanyAge": {
      "minimumAge": 1
    }
  },
  "detailsRequired": [
    {
      "category": "loanType",
      "detailRequired": [
        {
          "datapoint": "enquirySource",
          "id": "enquirySource",
          "prev": null,
          "questionText": "Are you the one who needs the loan (direct) or applying on behalf of someone else (introducer)?",
          "options": {
            "direct": "",
            "introducer": [
              "brokerEmailAddress",
              "brokerName",
              "brokerPhoneNumber"
            ]
          },
          "extract_only": true,
          "default_value": "introducer"
        },
        {
          "datapoint": "lenderName",
          "id": "lenderName",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "dateSubmitted",
          "id": "dateSubmitted",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "dealId",
          "id": "dealId",
          "prev": null,
          "extract_only": true,
          "questionText": "What is the Deal ID or Reference Number?"
        },
        {
          "datapoint": "applicationType",
          "id": "applicationType",
          "prev": null,
          "questionText": "Is the applicant an individual or a company?",
          "options": {
            "company": [
              "companyName",
              "companyRegisteredAddress",
              "companyPhoneNumber",
              "companyWebsite",
              "companyType",
              "companySicCode",
              "companyIncorporationDate",
              "companyNumber",
              "companyVatNumber",
              "companyFcaNumber"
            ],
            "individual": []
          }
        },
        {
          "datapoint": "loanType",
          "id": "loanType",
          "prev": null,
          "questionText": "What type of financing is the enquiry for? For example, Hire Purchase",
          "extract_only": true
        },
        {
          "datapoint": "enquiryType",
          "id": "enquiryType",
          "prev": null,
          "questionText": "What type of product is the enquiry for? For example, Lease Purchase",
          "extract_only": true
        },
        {
          "datapoint": "monthlyRepaymentAmount",
          "id": "monthlyRepaymentAmount",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "monthlyInterestRate",
          "id": "monthlyInterestRate",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "loanTerm",
          "id": "loanTerm",
          "prev": null
        },
        {
          "datapoint": "balloonRepayment",
          "id": "balloonRepayment",
          "prev": null
        },
        {
          "datapoint": "applicationBackground",
          "id": "applicationBackground",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "applicationProjectDetails",
          "id": "applicationProjectDetails",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "applicationFinancialsSummary",
          "id": "applicationFinancialsSummary",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "applicationSummary",
          "id": "applicationSummary",
          "prev": null,
          "extract_only": true
        }
      ]
    },
    {
      "category": "assetDetails",
      "detailRequired": [
        {
          "datapoint": "assetName",
          "id": "assetName",
          "prev": null
        },
        {
          "datapoint": "assetDescription",
          "id": "assetDescription",
          "prev": null
        },
        {
          "datapoint": "assetCost",
          "id": "assetCost",
          "prev": null
        },
        {
          "datapoint": "assetUnits",
          "id": "assetUnits",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "assetCondition",
          "id": "assetCondition",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "assetYearManufactured",
          "id": "assetYearManufactured",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "assetAge",
          "id": "assetAge",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "assetRegistrationNumber",
          "id": "assetRegistrationNumber",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "assetCurrentMileage",
          "id": "assetCurrentMileage",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "assetAnnualMileage",
          "id": "assetAnnualMileage",
          "prev": null,
          "extract_only": true
        }
      ]
    },
    {
      "category": "supplierDetails",
      "detailRequired": [
        {
          "datapoint": "supplierCompanyName",
          "id": "supplierCompanyName",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "supplierCompanyIncorporationDate",
          "id": "supplierCompanyIncorporationDate",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "supplierCompanyNumber",
          "id": "supplierCompanyNumber",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "supplierCompanyFcaNumber",
          "id": "supplierCompanyFcaNumber",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "supplierCompanyWebsite",
          "id": "supplierCompanyWebsite",
          "prev": null,
          "extract_only": true
        }
      ]
    },
    {
      "category": "itemDetails",
      "detailRequired": [
        {
          "datapoint": "itemCostExcludingVat",
          "id": "itemCostExcludingVat",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemVat",
          "id": "itemVat",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemNotVatableItems",
          "id": "itemNotVatableItems",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemCostIncludingVat",
          "id": "itemCostIncludingVat",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemAdvanceRepayments",
          "id": "itemAdvanceRepayments",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemAdditionalRepayments",
          "id": "itemAdditionalRepayments",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemNetPartExchangeExcludingVat",
          "id": "itemNetPartExchangeExcludingVat",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemVatOnNetPartExchange",
          "id": "itemVatOnNetPartExchange",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemNetVatPaidUpfront",
          "id": "itemNetVatPaidUpfront",
          "prev": null,
          "extract_only": true
        },
        {
          "datapoint": "itemTotalInitialPayment",
          "id": "depositAmount",
          "prev": null
        },
        {
          "datapoint": "loanAmountRequired",
          "id": "loanAmountRequired",
          "prev": null,
          "questionText": "What is the amount to finance?"
        }
      ]
    },
    {
      "category": "leadApplicantDetails",
      "detailRequired": [
        {
          "datapoint": "leadApplicantIsGuarantor",
          "id": "leadApplicantIsGuarantor",
          "prev": null,
          "questionText": "Is the lead applicant also the guarantor?",
          "options": {
            "yes": [],
            "no": [
              "guarantorName",
              "guarantorAddress",
              "guarantorEmailAddress",
              "guarantorPhoneNumber",
              "guarantorDateOfBirth",
              "guarantorMaritalStatus"
            ]
          },
          "extract_only": true
        },
        {
          "datapoint": "leadApplicantEmail",
          "id": "leadApplicantEmail",
          "prev": null
        },
        {
          "datapoint": "leadApplicantName",
          "id": "leadApplicantName",
          "prev": null
        },
        {
          "datapoint": "leadApplicantPhoneNumber",
          "id": "leadApplicantPhoneNumber",
          "prev": null
        },
        {
          "datapoint": "leadApplicantDob",
          "id": "leadApplicantDob",
          "prev": null
        },
        {
          "datapoint": "leadApplicantNationality",
          "id": "leadApplicantNationality",
          "prev": null,
          "deafult_value": "UK"
        },
        {
          "datapoint": "leadApplicantMaritalStatus",
          "id": "leadApplicantMaritalStatus",
          "prev": null,
          "options": [
            "single",
            "married"
          ],
          "extract_only": true
        },
        {
          "datapoint": "automatedProcessingConsent",
          "id": "automatedProcessingConsent",
          "prev": null,
          "extract_only": true,
          "options": [
            "yes",
            "no"
          ]
        },
        {
          "datapoint": "privacyNoticeConsent",
          "id": "privacyNoticeConsent",
          "prev": null,
          "extract_only": true,
          "options": [
            "yes",
            "no"
          ]
        },
        {
          "datapoint": "leadApplicantCurrentAddress",
          "id": "leadApplicantCurrentAddress",
          "prev": null,
          "questionText": "What is the lead applicant's current residential address?"
        },
        {
          "datapoint": "leadApplicantTimeAtCurrentAddress",
          "id": "leadApplicantTimeAtCurrentAddress",
          "prev": null,
          "questionText": "How long has the lead applicant lived at their current residential address?",
          "branchingRule": {
            "less than 3 years": [
              "leadApplicantPreviousAddress"
            ]
          }
        },
        {
          "datapoint": "leadApplicantPreviousAddress",
          "id": "leadApplicantPreviousAddress",
          "prev": "timeAtAddress",
          "questionText": "What is the lead applicant's previous residential address?"
        },
        {
          "datapoint": "leadApplicantBasicIncome",
          "id": "leadApplicantBasicIncome",
          "prev": null,
          "questionText": "What is the lead applicant's basic income?"
        },
        {
          "datapoint": "leadApplicantOtherSignificantExpenses",
          "id": "leadApplicantOtherSignificantExpenses",
          "prev": null,
          "questionText": "Does the lead applicant have any significant expenses? If so, how much? This does not include rent.",
          "default_value": "0"
        }
      ]
    },
    {
      "category": "guarantorDetails",
      "detailRequired": [
        {
          "datapoint": "guarantorName",
          "id": "guarantorName",
          "prev": "leadApplicantIsGuarantor"
        },
        {
          "datapoint": "guarantorAddress",
          "id": "guarantorAddress",
          "prev": "leadApplicantIsGuarantor"
        },
        {
          "datapoint": "guarantorEmailAddress",
          "id": "guarantorEmailAddress",
          "prev": "leadApplicantIsGuarantor"
        },
        {
          "datapoint": "guarantorPhoneNumber",
          "id": "guarantorPhoneNumber",
          "prev": "leadApplicantIsGuarantor"
        },
        {
          "datapoint": "guarantorDateOfBirth",
          "id": "guarantorDateOfBirth",
          "prev": "leadApplicantIsGuarantor"
        },
        {
          "datapoint": "guarantorMaritalStatus",
          "id": "guarantorMaritalStatus",
          "prev": "leadApplicantIsGuarantor"
        }
      ]
    },
    {
      "category": "companyDetails",
      "detailRequired": [
        {
          "datapoint": "companyName",
          "id": "companyName",
          "prev": "applicationType"
        },
        {
          "datapoint": "companyRegisteredAddress",
          "id": "companyRegisteredAddress",
          "prev": "applicationType"
        },
        {
          "datapoint": "companyPhoneNumber",
          "id": "companyPhoneNumber",
          "prev": "applicationType"
        },
        {
          "datapoint": "companyWebsite",
          "id": "companyWebsite",
          "prev": "applicationType"
        },
        {
          "datapoint": "companyType",
          "id": "companyType",
          "prev": "applicationType"
        },
        {
          "datapoint": "companySicCode",
          "id": "companySicCode",
          "prev": "applicationType"
        },
        {
          "datapoint": "companyIncorporationDate",
          "id": "companyIncorporationDate",
          "prev": "applicationType"
        },
        {
          "datapoint": "companyNumber",
          "id": "companyNumber",
          "prev": "applicationType"
        },
        {
          "datapoint": "companyVatNumber",
          "id": "companyVatNumber",
          "prev": "applicationType",
          "extract_only": true
        },
        {
          "datapoint": "companyFcaNumber",
          "id": "companyFcaNumber",
          "prev": "applicationType",
          "extract_only": true
        }
      ]
    },
    {
      "category": "brokerDetails",
      "detailRequired": [
        {
          "datapoint": "brokerName",
          "id": "brokerName",
          "prev": "enquirySource",
          "extract_only": true
        },
        {
          "datapoint": "brokerEmailAddress",
          "id": "brokerEmailAddress",
          "prev": "enquirySource",
          "extract_only": true
        },
        {
          "datapoint": "brokerPhoneNumber",
          "id": "brokerPhoneNumber",
          "prev": "enquirySource",
          "extract_only": true
        }
      ]
    }
  ],
  "adminEmail": [
    "tech@thisisjuno.ai",
    "jordan@thisisjuno.ai",
    "abhishek@thisisjuno.ai",
    "aleksei@thisisjuno.ai"
  ],
  "unified": {
    "messaging": "",
    "crm": [
      {
        "app": "Pipedrive",
        "connectionId": "67174d4540ba1d31c25cca25",
        "isActive": true,
        "apiKey": "140eb597155c8bce81bacc513d061b5d11814f1e"
      }
    ]
  },
  "enquireEmail": "thisisjuno.dev.1@gmail.com",
  "emailDomain": "haydock.co.uk",
  "responsePrompts": {
    "generalCase": "You are a friendly and professional email-writing assistant for a ${clientType} business called ${clientName}.\n        A potential customer or their representative has sent an email with some details of a loan application, but some of the application data may be missing. Your job is to reply to request the missing information in case.\n        You will receive a JSON object containing the email body of the latest email, some information about the applicant, and a list of data that is missing from a customer's loan application as 'questions' in the JSON object with value/answer/response as null.\n        Please write an email politely requesting the missing information. List the missing information and their descriptions in the format of bullet list (separate item for each datapoint).\n\n\t**Instructions**:\n       -  If an 'invalidDatapoints' value exists for a data point, DO include the explanation why the provided datapoint was incomplete, when you list the missing information. Start with \"Provided ...\"\n        - If the object contains a ‘queryResponse’ object with a value, you MUST include this in your response, but so that it would be coherent. This is an answer to the applicant's query.\n        IMPORTANT: Do NOT make a reference to answering the query, for example \"in answer to the query...\". Simply provide the answer without acknowledging that it's the answer to a query.\n        - If no query_response object is present in the JSON object, DO NOT reference a query or answer any questions.\n\n        - Do NOT add a subject line.\n\n        - Do NOT call the applicant by title, if it isn't filled in the datapoints.\n\n        - Do NOT invent any rules or restrictions.\n\n        - Provide a short summary of the application so far containing ALL given datapoints in the form of vertical table.\n\n        - All monetary amounts are in GBP (£).\n\n        - Write the email in HTML format. Do not include newline characters (\\n, \\r) or unescaped quotation marks (\") in the email; these will throw syntax errors.\n\n\t**Structure**:\n\t- Greetings/Thanks for reaching out.\n\t- Answer to the customer’s question if any (‘queryResponse’ object with a value is present).\n\t- Summary of application so far, listing all the datapoints currently extracted in the form of vertical table.\n\t- Request for missing data.\n\n        Write your email so when it renders, it starts like this:\n\n        Hello,\n        <content>\n\n\n        And ends like this:\n\n        Best wishes,\n        ${clientName}\n\n\t\n\tIMPORTANT: The whole email should be coherent and logically connected.\n\n\n        DON'T FORGET TO WRITE THE EMAIL IN HTML AND ALSO BEAUTIFY IT (PROFESSIONALLY ONLY) TO ENHANCE THE READABILITY LIKE MAKING HEADINGS OR IMPORTANT POINTS BOLD AND DENOTING FIGURES OR COMPARISON IF REQUIRED IN TABULAR STRUCTURE.\n\n        Your output should be a structured JSON object in the following format:\n        {\n          \"response\": \"<html email here>\"\n        }",
    "noNextQuestionsCase": "You are a friendly and professional email-writing assistant for a ${clientType} business called ${clientName}.\n    A potential customer or their representative has sent an email with a possible query after filling-in the application. Your job is to reply stating obtained information, shortly thank for filling-in the application and answer query if there are some.\n    You will receive a JSON object containing the email body of the latest email, some information about the applicant in the JSON object.\n    Please write an email politely.\n\n    If the object contains a queryResponse object with a value, you MUST include this in your response. This is an answer to the applicant's query.\n    IMPORTANT: Do NOT make a reference to answering the query, for example \"in answer to the query...\". Simply provide the answer without acknowledging that it's the answer to a query.\n    If no queryResponse object is present in the JSON object, DO NOT reference a query or answer any questions.\n\n    If \"Conclusion\" section is provided, it means that based on provided data, there is no loan available. You should say the conclusion and say that maybe they need to decrease requested loan amount.\n\n    If \"Additional Calculated datapoints\" section is given, create additional table with summary so far for this data. Say that it is a loan-related values we calculated.\n\n    Do NOT add a subject line.\n\n    Do NOT call the applicant by title, if it isn't filled in the datapoints.\n\n    Provide a short summary of the application containing ALL given datapoints in the format of table.\n\n    All monetary amounts are in GBP (£).\n\n    When thanking at the end, write: \"Thank you for the information provided. We will contact you as soon as we process the application.\"\n\n    Write the email in HTML format. Do not include newline characters (\\\\n, \\\\r) or unescaped quotation marks (\") in the email; these will throw syntax errors.\n\n    Write your email so when it renders, it starts like this:\n\n    Hello,\n    <content>\n\n\n    Write your email so when it renders, it ends like this:\n\n    Best wishes,\n    ${clientName}\n\n    DON'T FORGET TO WRITE THE EMAIL IN HTML AND ALSO BEAUTIFY IT (PROFESSIONALLY ONLY) TO ENHANCE THE READABILITY LIKE MAKING HEADINGS OR IMPORTANT POINTS BOLD AND DENOTING FIGURES OR COMPARISON IF REQUIRED IN TABULAR STRUCTURE.\n\n    Your output should be a structured JSON object in the following format:\n    {\n     \"response\": \"<html email here>\"\n    }",
    "irrelevantCase": "Hello,\nThank you for your enquiry! One of our team members will evaluate it and respond to you as soon as possible.\n\nBest regards,\n${clientName}"
  },
  "sendDocuments": [],
  "nylasGrantId": "0f4ca407-1f11-4128-9677-1e849c01d784",
  "emailAction": "SEND",
  "pandaDoc": {
    "docTemplates": [
      {
        "docName": "GDPR Form",
        "templateId": "Fomy3JPenpzdiksFhh6kGj"
      }
    ]
  },
  "followUpConfig": {
    "isActive": true,
    "configType": "FLAT",
    "flatGapInterval": [
      1,
      1,
      1,
      1
    ],
    "noOfFollowUps": 4
  },
  "mortgageCalculatorVars": {
    "annual_interest_rate": 3.5,
    "lti_multipliers": {
      "first_time_buyer_high_income_limit": 50000,
      "first_time_buyer_high_income_low_ltv": 4.3,
      "first_time_buyer_high_income_high_ltv": 5.2,
      "first_time_buyer_ltv_limit": 90,
      "default": 4
    },
    "max_income_to_mortgage_ratio": 0.35
  },
  "feature_flags": {
    "ntropyProcessing": true,
    "directorSearch": true,
    "openBanking": true,
    "bypassBusinessAccNameValidation": true,
    "documentProcessing": false,
    "linkExtraction": true
  },
  "requiredDocuments": [
    "bankStatement"
  ],
  "bankStatementValidationConfig": {
    "validDateRangeInMonth": "3",
    "requiredDocuments": [
      "bankStatement"
    ],
    "excludedBankNames": [
      "Royal Bank of Scotland"
    ]
  },
  "formEmail": [
    "jordan@thisisjuno.ai"
  ],
  "whitelistedDomains": [
    "google.com"
  ]
}