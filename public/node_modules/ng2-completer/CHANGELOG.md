# Change Log
All notable changes to this project will be documented in this file.

## 0.3.3
### Fixed bugs:
- Why version 0.3.2 requires @angular/*@2.2.4? #103
- Build with @angular version 2.3.1 to fix issue with metadata version

## 0.3.2
### Fixed bugs:
- Form is submitted when we select an option from dropdown using enter key #52

## 0.3.0
### Implemented enhancments
- Change deployment method now using ngc and rollup for the package and webpack for dev and demo
- AOT support #60

### Fixed bugs:
- TS5023 Build:Unknown compiler option 'forceConsistentCasingInFileName' #74
- .completer-selected-row is missing in the description #78
- originalObject is null for CompleterService in version 0.2.3 #81

## 0.2.3
### Implemented enhancments
- Clear selection when search changes #45

### Fixed bugs:
- fix for overrideSuggested

## 0.2.2 
### Implemented enhancments
- Added support for async local data

### Fixed bugs:
- Not able to capture blur event #50
- textSearching not display in first search #55

## 0.2.1 (2016-10-05)
### Implemented enhancments
- Added material2 component to demo

### Fixed bugs:
- Mouse click doesn't select the item, Enter Key does! #46


## 0.2.0 (2016-10-04)
This is a rewrite of the completer component using directives that implement most of the functionality.
### Implemented enhancments
- Support for custom HTML and CSS #13 #21

### Fixed bugs:
- Bump version dependency to angular 2.0.0 #39