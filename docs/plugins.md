# ATT.js Plugin Documentation

## The att.addressbook plugin



### Methods

  - att.addressbook.getContacts()

    
  - att.addressbook.getContact(string)

    
  - att.addressbook.addContact(object)

    
  - att.addressbook.updateContact(string, object)

    
  - att.addressbook.deleteContact(string)

    
  - att.addressbook.getGroups()

    
  - att.addressbook.getGroup(string)

    
  - att.addressbook.addGroup(object)

    
  - att.addressbook.updateGroup(string, object)

    
  - att.addressbook.deleteGroup(string)

    

### Events

  - <a id="att.addressbook-event-addressBookReady"></a>addressBookReady

    Raised when the addressbook object has been created with an access token.

## The att.me plugin

Helper method for retrieving a user's ATT profile information.

### Methods

  - att.getMe()

    Make an AJAX request to retrieve the user's profile information.

### Events

  - <a id="att.me-event-user"></a>user, called with: [UserProfile](#att.me-datatype-UserProfile)

    Raised when the user's profile information has been retrieved. Suitable for other plugins to listen for to finish their own initialization steps

## The att.messages plugin



### Methods

  - att.messages.sendMessage(string, string)

    
  - att.messages.getMessages()

    
  - att.messages.getMessage(string)

    
  - att.messages.deleteMessage(string)

    
  - att.messages.searchByNumber(string)

    

### Events

  - <a id="att.messages-event-messagesReady"></a>messagesReady

    Raised when the messages object has been created with an access token.

## The att.oauth2 plugin

This plugin allows easy user login and authorization from the att oauth system

### Methods

  - att.oauth2.authorizeURL()

    Returns an oauth authorize url for the configured client.
  - att.oauth2.login()

    Validated accessToken or updates elements with btn-att-login class with authroizeURL to fetch an accessToken.

## The att.phone.generic plugin

Common interface for making and receiving phone calls.

### Methods

  - att.dial(string phoneNumber)

    Dial a number and make an outgoing call.

### Events

  - <a id="att.phone.generic-event-phoneReady"></a>phoneReady

    Raised when the phone backend has been initialized and is ready to make or receive calls.

  - <a id="att.phone.generic-event-phoneError"></a>phoneError

    Raised when the phone backend could not be initialized.

  - <a id="att.phone.generic-event-calling"></a>calling, called with: string

    Raised with the phone number being dialed on an outgoing call.

  - <a id="att.phone.generic-event-outgoingCall"></a>outgoingCall, called with: [Call](#att.phone.generic-datatype-Call), callerDisplayName (string)

    Raised with a Call object for managing an outgoing call, and the phone number that is being dialed.

  - <a id="att.phone.generic-event-incomingCall"></a>incomingCall, called with: [Call](#att.phone.generic-datatype-Call), callerDisplayName (string)

    Raised with a Call object for managing an incoming call, and the phone number of the caller.

  - <a id="att.phone.generic-event-ring"></a>ring, called with: [Call](#att.phone.generic-datatype-Call), callerDisplayName (string)

    A signal that a call request is in progress.

  - <a id="att.phone.generic-event-callBegin"></a>callBegin, called with: [Call](#att.phone.generic-datatype-Call)

    Raised when a call has been answered and is ready for use.

  - <a id="att.phone.generic-event-callEnd"></a>callEnd, called with: [Call](#att.phone.generic-datatype-Call)

    Raised when a call has been hung up.

  - <a id="att.phone.generic-event-callError"></a>callError, called with: [Call](#att.phone.generic-datatype-Call)

    Emitted when an error has occured while establishing or during a call.

## The att.phonenumber plugin

A set of helper functions for parsing and processing phone number strings.

### Methods

  - att.phoneNumber.stringify(string)

    Format a phone number to include dashes and parenthesis.
  - att.phoneNumber.parse(string)

    Convert a phone number that uses letters into numeric format.
  - att.phoneNumber.getCallable(string, string countryCode)

    Parses a phone number string into a callable format.

## Data Types

### <a id="att.me-datatype-UserProfile"></a>UserProfile

A dictionary of profile information for a user, including name and phone number.

### <a id="att.phone.generic-datatype-Call"></a>Call

A phone call session, which may be answered or hung up.

### Methods

  - answer()

    Accept and answer an incoming phone call.
  - hangup()

    Decline, or end an existing, phone call

## Event Index

### addressBookReady
  - [att.addressbook](#att.addressbook)

### user
  - [att.me](#att.me)

### messagesReady
  - [att.messages](#att.messages)

### phoneReady
  - [att.phone.generic](#att.phone.generic)

### phoneError
  - [att.phone.generic](#att.phone.generic)

### calling
  - [att.phone.generic](#att.phone.generic)

### outgoingCall
  - [att.phone.generic](#att.phone.generic)

### incomingCall
  - [att.phone.generic](#att.phone.generic)

### ring
  - [att.phone.generic](#att.phone.generic)

### callBegin
  - [att.phone.generic](#att.phone.generic)

### callEnd
  - [att.phone.generic](#att.phone.generic)

### callError
  - [att.phone.generic](#att.phone.generic)