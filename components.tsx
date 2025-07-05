import React from 'react';
import { Video, Channel, Playlist, Comment } from './types';
import {
    PLACEHOLDER_AVATAR, PLACEHOLDER_THUMBNAIL,
    THEME_YELLOW_PRIMARY, THEME_YELLOW_BUTTON_TEXT,
    THEME_TEXT_ON_DARK_PRIMARY, THEME_TEXT_ON_DARK_SECONDARY,
    THEME_BG_SECONDARY, THEME_BORDER_PRIMARY, THEME_BG_TERTIARY_HOVER
} from './constants';
import { formatViews, formatFirestoreTimestamp } from './firebase';

// SVG Icons - Color will be inherited or set by className
export const PlayIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} xmlns="http://www.w3.org/2000/svg" className={className}><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-24.32-13.51V39.86a16,16,0,0,1,24.32-13.51L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path></svg>
);
export const MagnifyingGlassIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} xmlns="http://www.w3.org/2000/svg" className={className}><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path></svg>
);
export const HomeIcon: React.FC<{ size?: string; className?: string; isFilled?: boolean }> = ({ size = "24px", className, isFilled }) => (
    isFilled ?
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path></svg>
    :
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11a16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path></svg>
);
export const ShortsIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M251.77,73a8,8,0,0,0-8.21.39L208,97.05V72a16,16,0,0,0-16-16H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V159l35.56,23.71A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73ZM192,184H32V72H192V184Zm48-22.95-32-21.33V116.28L240,95Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8"></path></svg>
);
export const CreateIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Zm-32-80a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8"></path></svg>
);
export const SubscriptionsIcon: React.FC<{ size?: string; className?: string; isFilled?: boolean }> = ({ size = "24px", className, isFilled }) => (
    isFilled ?
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V48H184V209.57l-51.77-32.35Z"></path></svg>
    :
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,16V161.57l-51.77-32.35a8,8,0,0,0-8.48,0L72,161.56V48ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V180.43l56-35,56,35v29.14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8"></path></svg>
);
export const LibraryIcon: React.FC<{ size?: string; className?: string; isFilled?: boolean }> = ({ size = "24px", className, isFilled }) => (
    isFilled ?
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M216,40H40A16,16,0,0,0,24,56V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,152H40V56H216V192ZM184,88a8,8,0,0,1-16,0V80H112v56a8,8,0,0,1-16,0V80a16,16,0,0,1,16-16h64a16,16,0,0,1,16,16Z"></path></svg>
    :
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M216,40H40A16,16,0,0,0,24,56V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V192H40ZM176,72H112a8,8,0,0,0-8,8v56a8,8,0,0,0,16,0V88h48v8a8,8,0,0,0,16,0V80A8,8,0,0,0,176,72Z"></path></svg>
);

export const UserIcon: React.FC<{ size?: string; className?: string; isFilled?: boolean }> = ({ size = "24px", className, isFilled }) => (
  isFilled ?
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className} xmlns="http://www.w3.org/2000/svg"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/></svg>
  :
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className} xmlns="http://www.w3.org/2000/svg"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,0,1-29.14-168.65C100.7,48.34,103.21,48,104,48a88.1,88.1,0,0,1,88,88,87.23,87.23,0,0,1-2.43,20.88A3.94,3.94,0,0,0,189.14,160c12,0,24.85,2.87,36.23,8.8A88.23,88.23,0,0,1,128,216Zm0-112a40,40,0,1,1,40,40A40,40,0,0,1,128,104Zm80,87.12C197.34,183.54,185.83,176,172,176a20.1,20.1,0,0,0-4.32.42a72,72,0,1,0-79.36,0A20.1,20.1,0,0,0,84,176c-13.83,0-25.34,7.54-36,15.12A87.66,87.66,0,0,1,40,128a88.1,88.1,0,0,1,88-88A88.1,88.1,0,0,1,216,128,87.66,87.66,0,0,1,208,191.12Z"/></svg>
);


export const BackIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path></svg>
);
export const ClearIcon: React.FC<{ size?: string; className?: string }> = ({ size = "20px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>
);
export const SettingsIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path></svg>
);

export const ChevronDownIcon: React.FC<{ size?: string; className?: string }> = ({ size = "16px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M208.49,99.51a12,12,0,0,0-17,0L128,163,64.49,99.51a12,12,0,0,0-17,17l72,72a12,12,0,0,0,17,0l72-72A12,12,0,0,0,208.49,99.51Z"></path></svg>
);
export const MoreVertIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 24 24" width={size} className={className} xmlns="http://www.w3.org/2000/svg"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
);
export const ChevronRightIcon: React.FC<{ size?: string; className?: string }> = ({ size = "20px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg>
);
export const ClockIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path></svg>
);

export const ThumbsUpIcon: React.FC<{ size?: string; className?: string; isFilled?: boolean }> = ({ size = "24px", className, isFilled }) => (
  isFilled ?
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM72,200H32V112H72ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"/></svg>
  :
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32Zm180,85a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9l-12,96Z"/></svg>
);

export const ThumbsDownIcon: React.FC<{ size?: string; className?: string; isFilled?: boolean }> = ({ size = "24px", className, isFilled }) => (
  isFilled ?
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M224,64H47.06L84.84,15.1A8,8,0,0,0,77.68.86L32,56.6V192a40,40,0,0,0,40,40H96a8,8,0,0,0,7.16-4.42L140.94,160H184a16,16,0,0,0,16-16V72a8,8,0,0,0-8-8H140.94l-36.72-73.43A24,24,0,0,1,87.06,24h.22l.08,0L224,64Z"/></svg> // Simplified filled version
  :
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M224,64H47.06L84.84,15.1A8,8,0,0,0,77.68.86L32,56.6V192a40,40,0,0,0,40,40H96a8,8,0,0,0,7.16-4.42L140.94,160H184a16,16,0,0,0,16-16V72a8,8,0,0,0-8-8H140.94l-36.72-73.43A24,24,0,0,1,87.06,24h.22l.08,0L224,64ZM88,216H72a24,24,0,0,1-24-24V73.27L84.94,32H87a8,8,0,0,0,0,16H60.16l-12,24H176V88H134.8A24,24,0,0,0,112.22,99.8L72,171.22V216Z"/></svg> // Actual outlined version
);
// A better ThumbsDown (original from a library)
export const ThumbsDownIconPhosphor: React.FC<{ size?: string; className?: string; isFilled?: boolean }> = ({ size = "24px", className, isFilled }) => (
    isFilled ?
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M22,175.88A24,24,0,0,0,40,184H96v16a40,40,0,0,0,40,40,8,8,0,0,0,7.16-4.42L180.94,160H224a16,16,0,0,0,16-16V56a16,16,0,0,0-16-16H52.18A24,24,0,0,0,32.06,49l-12,96A24,24,0,0,0,22,175.88ZM184,56h40v88H184ZM40.06,161l12-96a8,8,0,0,1,7.94-7H168V149.89l-36.71,73.43A24,24,0,0,1,112,200V176a8,8,0,0,0-8-8H40a8,8,0,0,1-7.94-9Z"/></svg>
    :
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M224,40H52.18A24,24,0,0,0,32.06,49l-12,96A24,24,0,0,0,22,175.88V184a24,24,0,0,0,18,23.88A24.07,24.07,0,0,0,48,208H96v16a40,40,0,0,0,40,40,8,8,0,0,0,7.16-4.42L180.94,160H224a16,16,0,0,0,16-16V56A16,16,0,0,0,224,40Zm0,16v88H172.94l-36.72,73.43A24,24,0,0,1,112,200V176a8,8,0,0,0-8-8H40a8,8,0,0,1-7.94-9l12-96a8,8,0,0,1,7.94-7H224Z"/></svg>
);


export const ShareIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M237.62,125.79,101.62,37.79a12,12,0,0,0-18.54,9.91V80C40.12,80,16,104.12,16,147c0,38.33,21.14,67.5,50.48,81.55a12,12,0,0,0,14.5-14.5c-17.3-8.18-28.53-22.46-28.87-41.45-.4-21.23,14.23-36.6,39.51-36.6H83.08v32.3a12,12,0,0,0,18.54,9.91l136-88A12,12,0,0,0,237.62,125.79ZM95.08,194.58V168a12,12,0,0,0-12-12H45.13c-5.15,0-12.07,2.7-17,8.18C47.55,150.7,59.08,135,59.08,115c0-23.81,17.24-35,41.62-35h36.38a12,12,0,0,0,12-12V41.42L213.35,128Z"></path></svg>
);

export const PlaylistAddIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M224,120v64a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V72A16,16,0,0,1,48,56h85.34A40,40,0,0,0,128,40a8,8,0,0,1,0-16,56.06,56.06,0,0,1,56,56,8,8,0,0,1-16,0,40,40,0,0,0-40-40H48V184H208V120a8,8,0,0,1,16,0ZM98,82a10,10,0,1,0-10-10A10,10,0,0,0,98,82Zm0,40a10,10,0,1,0-10-10A10,10,0,0,0,98,122Zm0,40a10,10,0,1,0-10-10A10,10,0,0,0,98,162Zm112-50h-2v-2a8,8,0,0,0-16,0v2h-2a8,8,0,0,0,0,16h2v2a8,8,0,0,0,16,0v-2h2a8,8,0,0,0,0-16Z"></path></svg>
);

export const ListIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg>
);

export const CameraIcon: React.FC<{ size?: string; className?: string }> = ({ size = "24px", className }) => (
    <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} xmlns="http://www.w3.org/2000/svg" className={className}><path d="M208,56H180.28L166.65,35.5A16,16,0,0,0,152.43,28H103.57a16,16,0,0,0-14.22,7.5L75.72,56H48A24,24,0,0,0,24,80V200a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,144a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,8-8,8.34,8.34,0,0,0,1.35-1.6L98.43,44h59.14l9.08,16.4a8.34,8.34,0,0,0,1.35,1.6,8,8,0,0,0,8,8h32a8,8,0,0,1,8,8ZM128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Z"></path></svg>
);

// Google Icon (for Sign In button)
export const GoogleIcon: React.FC<{ size?: string; className?: string }> = ({ size = "20px", className }) => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48" className={className}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

// New icons for channel page
export const BellIcon: React.FC<{ size?: string; className?: string; isFilled?: boolean }> = ({ size = "24px", className, isFilled }) => (
  isFilled ?
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Z"/></svg>
  :
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/></svg>
);

export const CheckIcon: React.FC<{ size?: string; className?: string }> = ({ size = "16px", className }) => (
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>
);

export const SortIcon: React.FC<{ size?: string; className?: string }> = ({ size = "20px", className }) => (
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M128,128a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16h72A8,8,0,0,1,128,128ZM48,72H184a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16ZM104,184H48a8,8,0,0,0,0,16h56a8,8,0,0,0,0-16Zm139.31-2.34a8,8,0,0,1-11.32,11.32L224,185l-7.99,7.98a8,8,0,0,1-11.32-11.32L217.37,169a8,8,0,0,1,11.32,0ZM224,71l7.99,7.98a8,8,0,0,0,11.32-11.32L230.63,55a8,8,0,0,0-11.32,0L206.63,67.66a8,8,0,0,0,11.32,11.32Z"/></svg>
);

export const GridIcon: React.FC<{ size?: string; className?: string }> = ({ size = "20px", className }) => (
  <svg fill="currentColor" height={size} viewBox="0 0 256 256" width={size} className={className}><path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48ZM104,136H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"/></svg>
);

// Loading Spinner
export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[${THEME_YELLOW_PRIMARY}]`}></div>
  </div>
);

// Error Message
interface ErrorMessageProps {
  message: string;
}
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="p-4 text-center text-red-400 bg-red-900/30 rounded-lg">
    <p>{message}</p>
  </div>
);


// Video Card Component
interface VideoCardProps {
  video: Video;
  type: 'home' | 'search' | 'channel' | 'upNext' | 'libraryHistory' | 'favoriteChannels';
  onVideoClick: (videoId: string) => void;
  onChannelClick?: (channelId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, type, onVideoClick, onChannelClick }) => {
  const handleVideoClick = () => onVideoClick(video.id);
  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video.channelId && onChannelClick) {
      onChannelClick(video.channelId);
    }
  };

  const views = formatViews(video.views);
  const uploadDate = typeof video.uploadDate === 'string' ? video.uploadDate : formatFirestoreTimestamp(video.lastWatched || video.uploadDate);

  if (type === 'favoriteChannels') {
    return (
      <div className="flex flex-col gap-2 cursor-pointer group" onClick={handleVideoClick}>
        <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
          <img src={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex items-start gap-2">
          <img
            alt={video.channelName || 'Channel'}
            className="size-6 rounded-full object-cover cursor-pointer flex-shrink-0"
            src={video.channelAvatarUrl || PLACEHOLDER_AVATAR}
            onClick={onChannelClick && video.channelId ? handleChannelClick : undefined}
          />
          <div className="min-w-0 flex-1">
            <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-sm font-medium leading-tight line-clamp-2 group-hover:text-[${THEME_YELLOW_PRIMARY}] transition-colors`}>{video.title}</p>
            <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-xs font-normal leading-normal mt-0.5`}>
              {video.channelName || 'Unknown Channel'}
            </p>
            <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-xs font-normal leading-normal`}>
              {views} views · {uploadDate}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'home') {
    return (
      <div className="flex flex-col gap-3 cursor-pointer group" onClick={handleVideoClick}>
        <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
          <img src={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex items-start gap-3">
          <img
            alt={video.channelName || 'Channel'}
            className="size-9 rounded-full object-cover cursor-pointer"
            src={video.channelAvatarUrl || PLACEHOLDER_AVATAR}
            onClick={onChannelClick && video.channelId ? handleChannelClick : undefined}
          />
          <div>
            <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-base font-semibold leading-tight line-clamp-2 group-hover:text-[${THEME_YELLOW_PRIMARY}] transition-colors`}>{video.title}</p>
            <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-sm font-normal leading-normal`}>
              {video.channelName || 'Unknown Channel'} · {views} views · {uploadDate}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'search') {
    return (
      <div className={`flex items-center gap-4 bg-transparent hover:bg-[${THEME_BG_TERTIARY_HOVER}] p-2 rounded-lg transition-colors cursor-pointer group`} onClick={handleVideoClick}>
        <div className="bg-center bg-no-repeat aspect-video bg-cover rounded-lg w-32 h-auto shrink-0 overflow-hidden">
            <img src={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex flex-col justify-center overflow-hidden">
          <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-base font-medium leading-normal line-clamp-2 group-hover:text-[${THEME_YELLOW_PRIMARY}] transition-colors`}>{video.title}</p>
          <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-sm font-normal leading-normal line-clamp-1`}> {/* Changed from THEME_YELLOW_PRIMARY/70 for consistency */}
            {video.channelName || 'Unknown Channel'} · {views} views · {uploadDate}
          </p>
        </div>
      </div>
    );
  }

  if (type === 'channel') {
    return (
      <div className="flex flex-col gap-2.5 pb-3 group cursor-pointer" onClick={handleVideoClick}>
        <div className="relative w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL} alt={video.title} />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">{video.duration}</div>
        </div>
        <div className="flex items-start gap-2">
          <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-sm font-semibold leading-snug flex-1 group-hover:text-[${THEME_YELLOW_PRIMARY}] transition-colors line-clamp-2`}>{video.title}</p>
          <button className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:text-[${THEME_TEXT_ON_DARK_PRIMARY}] transition-colors`} onClick={(e) => {e.stopPropagation(); alert(`Options for ${video.title}`);}}>
             <MoreVertIcon size="18px" />
          </button>
        </div>
      </div>
    );
  }

  if (type === 'upNext') {
    return (
       <div className={`p-4 @container cursor-pointer hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`} onClick={handleVideoClick}>
            <div className="flex flex-col items-stretch justify-start rounded-xl @md:flex-row @md:items-start gap-3">
                <div className="w-full @md:w-40 @md:h-24 bg-center bg-no-repeat aspect-video @md:aspect-auto bg-cover rounded-lg shrink-0 overflow-hidden">
                  <img src={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL} alt={video.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex w-full grow flex-col items-stretch justify-center gap-0.5 @md:py-0">
                    <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-base font-medium leading-snug line-clamp-2`}>{video.title}</p>
                    <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-xs font-normal leading-normal`}>{video.channelName || 'Streamr Channel'}</p>
                    <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-xs font-normal leading-normal`}>{views} Views · {uploadDate}</p>
                </div>
            </div>
        </div>
    );
  }

  if (type === 'libraryHistory') {
    return (
        <li className={`flex items-center gap-4 p-3 rounded-lg hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors duration-150 cursor-pointer`} onClick={handleVideoClick}>
            <div className="bg-center bg-no-repeat aspect-video bg-cover rounded-lg w-24 h-14 shrink-0 overflow-hidden">
              <img src={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL} alt={video.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow overflow-hidden">
                <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-base font-medium leading-normal line-clamp-1`}>{video.title}</p>
                <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-sm font-normal leading-normal line-clamp-1`}>{video.channelName || 'Unknown Channel'}</p>
            </div>
            <ChevronRightIcon className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}]`} />
        </li>
    );
  }

  return null;
};

// Channel Card Component for Favorite Channels section
interface ChannelCardProps {
  channel: Channel;
  latestVideo?: Video;
  onChannelClick: (channelId: string) => void;
  onVideoClick?: (videoId: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, latestVideo, onChannelClick, onVideoClick }) => {
  const handleChannelClick = () => onChannelClick(channel.id);
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (latestVideo && onVideoClick) {
      onVideoClick(latestVideo.id);
    }
  };

  return (
    <div className="flex flex-col gap-3 cursor-pointer group" onClick={handleChannelClick}>
      {/* Channel Avatar */}
      <div className="flex items-center justify-center">
        <img
          src={channel.avatarUrl || PLACEHOLDER_AVATAR}
          alt={channel.name}
          className="size-16 rounded-full object-cover ring-2 ring-transparent group-hover:ring-yellow-400/50 transition-all duration-300"
        />
      </div>
      
      {/* Channel Info */}
      <div className="text-center">
        <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-sm font-semibold leading-tight group-hover:text-[${THEME_YELLOW_PRIMARY}] transition-colors line-clamp-1`}>
          {channel.name}
        </p>
        <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-xs font-normal leading-normal mt-0.5`}>
          {formatViews(channel.subscribersCount)} subscribers
        </p>
      </div>

      {/* Latest Video (if available) */}
      {latestVideo && (
        <div className="cursor-pointer" onClick={handleVideoClick}>
          <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
            <img src={latestVideo.thumbnailUrl || PLACEHOLDER_THUMBNAIL} alt={latestVideo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="mt-2">
            <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-xs font-medium leading-tight line-clamp-2 group-hover:text-[${THEME_YELLOW_PRIMARY}] transition-colors`}>
              {latestVideo.title}
            </p>
            <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-xs font-normal leading-normal mt-0.5`}>
              {formatViews(latestVideo.views)} views · {formatFirestoreTimestamp(latestVideo.uploadDate)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};


// Playlist Item Card
interface PlaylistItemProps {
  playlist: Playlist;
  onClick: (playlistId: string) => void;
}
export const PlaylistItemCard: React.FC<PlaylistItemProps> = ({ playlist, onClick }) => {
  const getIcon = () => {
    switch(playlist.icon) {
      case 'Clock': return <ClockIcon />;
      case 'ThumbsUp': return <ThumbsUpIcon isFilled={false} />; // Example usage, assuming ThumbsUpIcon can take isFilled
      case 'List': return <ListIcon />;
      default: return <ListIcon />;
    }
  };
  return (
    <li
      className={`flex items-center gap-4 p-3 rounded-lg hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors duration-150 cursor-pointer`}
      onClick={() => onClick(playlist.id)}
    >
      <div className={`text-[${THEME_YELLOW_PRIMARY}] flex items-center justify-center rounded-lg bg-[${THEME_BG_SECONDARY}] shrink-0 size-12`}>
        {getIcon()}
      </div>
      <div className="flex-grow">
        <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-base font-medium leading-normal line-clamp-1`}>{playlist.name}</p>
        <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-sm font-normal leading-normal line-clamp-2`}>{playlist.videoCount} videos</p>
      </div>
      <ChevronRightIcon className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}]`} />
    </li>
  );
};

// Comment Item
interface CommentItemProps {
  comment: Comment;
}
export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => (
  <div className="flex items-start gap-2">
    <div
      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-8 w-8 shrink-0 mt-0.5"
      style={{ backgroundImage: `url("${comment.userAvatarUrl || PLACEHOLDER_AVATAR}")` }}
    ></div>
    <div className={`flex-1 bg-[${THEME_BG_SECONDARY}] p-3 rounded-lg`}> {/* Changed from bg-white/5 */}
      {comment.userName && <p className={`text-sm font-semibold text-[${THEME_TEXT_ON_DARK_PRIMARY}] mb-1`}>{comment.userName}</p>}
      <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}]/90 text-sm leading-relaxed`}>{comment.text}</p> {/* Adjusted for slightly less emphasis */}
      <p className={`text-xs text-[${THEME_TEXT_ON_DARK_SECONDARY}]/80 mt-1`}>{formatFirestoreTimestamp(comment.timestamp)}</p> {/* Adjusted for less emphasis */}
    </div>
  </div>
);

// Enhanced Channel Header for Channel Page
interface ChannelHeaderProps {
  channel: Channel;
  onSubscribe: () => void;
  isSubscribed?: boolean;
  videosCount?: number;
  showNotificationBell?: boolean;
  onNotificationToggle?: () => void;
  isNotificationEnabled?: boolean;
}
export const ChannelHeader: React.FC<ChannelHeaderProps> = ({ 
  channel, 
  onSubscribe, 
  isSubscribed, 
  videosCount,
  showNotificationBell = false,
  onNotificationToggle,
  isNotificationEnabled = false
}) => (
  <div className="flex p-6 @container items-center justify-center text-center">
    <div className="flex flex-col gap-4 items-center max-w-2xl">
      {/* Channel Banner (if available) */}
      {channel.bannerUrl && (
        <div className="w-full h-32 sm:h-40 md:h-48 rounded-xl overflow-hidden mb-4">
          <img src={channel.bannerUrl} alt={`${channel.name} banner`} className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Channel Avatar */}
      <div
        className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32 ring-4 ring-[${THEME_YELLOW_PRIMARY}]/30 shadow-lg`}
        style={{ backgroundImage: `url("${channel.avatarUrl || PLACEHOLDER_AVATAR}")` }}
      ></div>
      
      {/* Channel Info */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-2">
          <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-2xl font-bold leading-tight tracking-tight`}>{channel.name}</p>
          {isSubscribed && (
            <div className={`flex items-center gap-1 bg-[${THEME_BG_SECONDARY}] px-2 py-1 rounded-full`}>
              <CheckIcon className={`text-[${THEME_YELLOW_PRIMARY}]`} />
              <span className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-xs font-medium`}>Verified</span>
            </div>
          )}
        </div>
        
        <div className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-sm font-normal leading-normal mb-4 space-y-1`}>
          <p>{formatViews(channel.subscribersCount)} subscribers</p>
          <p>{videosCount || channel.videoCount} videos</p>
        </div>
        
        {/* Channel Description (if available) */}
        {channel.description && (
          <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-sm leading-relaxed text-center max-w-md mb-4`}>
            {channel.description}
          </p>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSubscribe}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
            isSubscribed 
              ? `bg-[${THEME_BG_SECONDARY}] text-[${THEME_TEXT_ON_DARK_PRIMARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}]`
              : `bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}] hover:opacity-90 shadow-lg`
          }`}
        >
          {isSubscribed ? (
            <>
              <CheckIcon />
              <span>Subscribed</span>
            </>
          ) : (
            <span>Subscribe</span>
          )}
        </button>
        
        {/* Notification Bell (only show if subscribed) */}
        {showNotificationBell && isSubscribed && onNotificationToggle && (
          <button
            onClick={onNotificationToggle}
            className={`flex items-center justify-center p-2.5 rounded-full transition-colors ${
              isNotificationEnabled 
                ? `bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}]`
                : `bg-[${THEME_BG_SECONDARY}] text-[${THEME_TEXT_ON_DARK_PRIMARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}]`
            }`}
            title={isNotificationEnabled ? "Turn off notifications" : "Turn on notifications"}
          >
            <BellIcon isFilled={isNotificationEnabled} />
          </button>
        )}
      </div>
    </div>
  </div>
);