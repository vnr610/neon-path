# Requirements Document

## Introduction

This feature ensures that clicking a navigation menu item while already on a sub-page of that section navigates the user back to the root of that section. For example, if the user is reading `/blog/some-post` and clicks "Writeups" in the navbar, they are taken to `/blog` (the section root) rather than staying on the current page or doing nothing. This applies to all navigable sections in the application: Home, About, Skills, Writeups, Dev Diary, Contact, Projects, Timeline, Certifications, and Guestbook.

## Glossary

- **Navbar**: The sticky top navigation bar rendered by `src/components/layout/Navbar.tsx`, containing primary links and the "More" dropdown.
- **Nav_Item**: A single clickable link in the Navbar corresponding to a top-level section (e.g., "Writeups", "Projects").
- **Section_Root**: The top-level route path for a section (e.g., `/blog` for Writeups, `/projects` for Projects).
- **Sub-page**: Any route that begins with a Section_Root path but is not the Section_Root itself (e.g., `/blog/some-post`, `/projects/my-project`).
- **Active_Section**: The section whose Section_Root matches or is a prefix of the current URL pathname.
- **Router**: The React Router instance managing client-side navigation.
- **Primary_Links**: The set of Nav_Items rendered in the main horizontal navbar: Home, About, Skills, Writeups, Dev Diary, Contact.
- **More_Links**: The set of Nav_Items rendered inside the "More" dropdown: Projects, Timeline, Certifications, Guestbook.
- **Mobile_Menu**: The collapsible full-screen navigation panel shown on small viewports.

## Requirements

### Requirement 1: Root Navigation on Active Section Click

**User Story:** As a visitor, I want clicking a nav menu item while already within that section to take me to the section root, so that I can quickly return to the top-level listing or landing page without using the browser back button.

#### Acceptance Criteria

1. WHEN a user clicks a Nav_Item and the current pathname equals the Section_Root for that Nav_Item, THE Router SHALL navigate to the Section_Root (no-op navigation is acceptable; the page SHALL scroll to the top).
2. WHEN a user clicks a Nav_Item and the current pathname is a Sub-page of that Nav_Item's Section_Root, THE Router SHALL navigate to the Section_Root of that Nav_Item.
3. WHEN a user clicks a Nav_Item and the current pathname is outside the Active_Section for that Nav_Item, THE Router SHALL navigate to the Section_Root of that Nav_Item as it does today.
4. THE Navbar SHALL apply root-navigation behaviour to all Nav_Items in Primary_Links.
5. THE Navbar SHALL apply root-navigation behaviour to all Nav_Items in More_Links.
6. THE Navbar SHALL apply root-navigation behaviour to all Nav_Items rendered in the Mobile_Menu.

### Requirement 2: Scroll-to-Top on Root Navigation

**User Story:** As a visitor, I want the page to scroll to the top when I navigate to a section root via the navbar, so that I always see the beginning of the page after navigating.

#### Acceptance Criteria

1. WHEN the Router navigates to a Section_Root as a result of a Nav_Item click, THE application SHALL scroll the viewport to the top of the page.
2. WHILE the user is already at the Section_Root and clicks the corresponding Nav_Item, THE application SHALL scroll the viewport to the top of the page.

### Requirement 3: Active Visual State Preservation

**User Story:** As a visitor, I want the correct nav item to remain visually highlighted while I am anywhere within that section, so that I always know which section I am in.

#### Acceptance Criteria

1. WHILE the current pathname is a Sub-page of a Section_Root, THE Navbar SHALL render the corresponding Nav_Item in its active visual style (highlighted colour and underline indicator).
2. WHILE the current pathname equals a Section_Root, THE Navbar SHALL render the corresponding Nav_Item in its active visual style.
3. WHEN the Router navigates away from a section, THE Navbar SHALL remove the active visual style from the previously active Nav_Item.

### Requirement 4: Mobile Menu Closure on Navigation

**User Story:** As a mobile visitor, I want the mobile menu to close automatically when I tap a nav item, so that I can see the destination page without manually dismissing the menu.

#### Acceptance Criteria

1. WHEN a user taps a Nav_Item in the Mobile_Menu and root-navigation is triggered, THE Mobile_Menu SHALL close before or immediately after the Router navigates.
2. WHEN a user taps a Nav_Item in the Mobile_Menu and the destination is outside the current Active_Section, THE Mobile_Menu SHALL close as it does today.

### Requirement 5: More Dropdown Closure on Navigation

**User Story:** As a visitor, I want the "More" dropdown to close automatically when I click a nav item inside it, so that the dropdown does not remain open after navigation.

#### Acceptance Criteria

1. WHEN a user clicks a Nav_Item inside the More_Links dropdown and root-navigation is triggered, THE Navbar SHALL close the More_Links dropdown before or immediately after the Router navigates.
2. WHEN a user clicks a Nav_Item inside the More_Links dropdown and the destination is outside the current Active_Section, THE Navbar SHALL close the More_Links dropdown as it does today.

### Requirement 6: No Duplicate History Entries

**User Story:** As a visitor, I want clicking a nav item while already at the section root to not push a duplicate entry onto the browser history stack, so that the back button behaves predictably.

#### Acceptance Criteria

1. WHEN a user clicks a Nav_Item and the current pathname already equals the Section_Root for that Nav_Item, THE Router SHALL use a replace navigation (not a push) to avoid adding a duplicate history entry.
2. WHEN a user clicks a Nav_Item and the current pathname is a Sub-page of that Nav_Item's Section_Root, THE Router SHALL use a standard push navigation to the Section_Root so the user can navigate back to the Sub-page.
