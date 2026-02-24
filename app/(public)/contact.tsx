import React, { useState, useCallback } from 'react'; // React hooks for managing state and optimizing callbacks
import {
  View, // A fundamental building block for UI, supports layout with flexbox, style, some touch handling, and accessibility controls.
  Text, // A React component for displaying text.
  ScrollView, // A generic scrolling container that can host multiple components and views.
  Platform, // React Native module to detect the platform (iOS, Android, web) to apply platform-specific logic.
  Linking, // React Native module to interact with app and web links, used for opening URLs.
  TouchableOpacity, // A wrapper for making views respond properly to touches, providing visual feedback.
  TextInput, // A foundational component for inputting text into the app via a keyboard.
  ActivityIndicator, // Displays a circular loading indicator, commonly used during async operations.
  Alert, // React Native module to show an alert dialog, useful for user confirmations or error messages.
} from 'react-native';
import { WebView } from 'react-native-webview'; // Component to render web content within a native view, used for Google Maps embed.
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; // Icon set from Google Material Design, providing a wide range of vector icons.
import { useSubmitContactMessage } from '@/tanstack/useContact'; // Custom TanStack Query hook for submitting contact form messages to the backend API.
import { useAuth } from '../../contexts/AuthContext'; // Custom hook to access the authentication context, providing user details and authentication status.
import { useRouter } from 'expo-router'; // Custom hook from Expo Router for programmatic navigation.

/**
 * @function DetailCard
 * @description A reusable presentational component designed to display a single piece of store contact information.
 * It's rendered as a tappable card, featuring an icon, a descriptive title, and the actual contact value.
 * Optionally, it can trigger an external application (like email client, phone dialer, or maps) when tapped via a URL.
 *
 * @param {object} props - The properties object for the DetailCard component.
 * @param {string} props.icon - The name of the MaterialIcons icon to display on the card (e.g., "email", "phone", "location-on").
 * @param {string} props.title - A brief label describing the contact detail (e.g., "Email", "Phone", "Location").
 * @param {string} props.value - The actual contact information to be displayed (e.g., "contact@example.com", "+1234567890").
 * @param {string} [props.url] - An optional URL string. If provided, the card becomes tappable and will open this URL using `Linking.openURL`.
 */
const DetailCard = ({ icon, title, value, url }: { icon: any; title: string; value: string; url?: string }) => (
  // TouchableOpacity: Acts as the main container for the card, making it interactive.
  // The `onPress` prop is conditionally set to open the provided URL, and `disabled` prevents interaction if no URL.
  <TouchableOpacity
    onPress={() => url && Linking.openURL(url)} // Opens the URL if provided.
    disabled={!url} // Disables the touch feedback if no URL is present.
    className="flex-row items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-4" // Tailwind classes for layout, styling, and spacing.
  >
    {/* View: Circular container for the icon, providing a visual background. */}
    <View className="h-12 w-12 rounded-full bg-brand-tint items-center justify-center">
      {/* MaterialIcons: Displays the specified icon. */}
      <MaterialIcons name={icon} size={24} color={'#D4AF37'} />
    </View>
    {/* View: Flexible container for the title and value text, allowing them to expand. */}
    <View className="ml-4 flex-1">
      {/* Text: Displays the descriptive title for the contact detail. */}
      <Text className="text-sm font-bold text-gray-500">{title}</Text>
      {/* Text: Displays the actual contact value. */}
      <Text className="text-base font-semibold text-gray-900">{value}</Text>
    </View>
  </TouchableOpacity>
);


/**
 * @function ContactPage
 * @description Main component for the Contact Us page. It displays store location, contact details,
 * and a form for users to send messages. It integrates with authentication context for pre-filling
 * form fields and uses a mutation hook to submit contact messages to the backend.
 */
export default function ContactPage() {
  // useRouter: Hook from Expo Router for programmatic navigation.
  const router = useRouter();
  // useAuth: Custom hook to get current user's authentication status and details.
  const { user, isAuthenticated } = useAuth();
  // useSubmitContactMessage: Custom hook (from TanStack Query) to handle the submission of contact form data to the API.
  const submitMessageMutation = useSubmitContactMessage();

  // useState: Manages the state of the contact form inputs.
  // Fields are pre-filled with authenticated user's data if available.
  const [form, setForm] = useState({
    name: isAuthenticated && user ? `${user.firstName} ${user.lastName}` : '', // Pre-fill name if user is authenticated.
    email: isAuthenticated && user ? user.email : '', // Pre-fill email if user is authenticated.
    phone: isAuthenticated && user ? user.phone || '' : '', // Pre-fill phone if user is authenticated, ensuring it's a string.
    subject: '', // State for the subject input field.
    message: '', // State for the message input field.
  });

  // useState: Manages the display of inline success or error messages to the user after form submission.
  const [inlineMessage, setInlineMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // mapEmbedUrl: Constant holding the Google Maps embed URL for the store's location.
  // IMPORTANT: Developers should replace this placeholder URL with their actual Google Maps embed URL for the business location.
  const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.8352276203846!2d36.71497717460087!3d-1.3709677986160578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f05e501aa7cff%3A0xb99d9f763ec7127c!2sOlolua%20Ridge%20Apartments!5e1!3m2!1sen!2ske!4v1768807784410!5m2!1sen!2ske';

  // storeDetails: Object containing static contact information for the store, displayed in DetailCard components.
  const storeDetails = {
    email: 'contact@appointmentclient.com',
    phone: '+254 712 345 678',
    location: 'Ololua Ridge, Nairobi, Kenya',
    instagram: '@appointment_client', // Instagram handle, used with a generic icon.
    facebook: 'Appointment Client', // Facebook page name, used with a generic icon.
  };

  /**
   * @function handleInputChange
   * @description A memoized callback function that updates the form state when any input field changes.
   * It also ensures that any previously displayed inline success/error messages are cleared.
   *
   * @param {keyof typeof form} name - The name of the form field that is being updated.
   * @param {string} value - The new value entered into the form field.
   */
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [name]: value })); // Updates the specific form field.
    setInlineMessage(null); // Clears any inline messages.
  }, []); // Empty dependency array means this function is created once.

  /**
   * @function handleSubmit
   * @description A memoized asynchronous callback function that handles the submission of the contact form.
   * It performs client-side validation, calls the API to send the message, and provides user feedback.
   * Upon successful submission, it clears appropriate form fields.
   */
  const handleSubmit = useCallback(async () => {
    // Basic client-side validation: Checks if all required fields (name, email, subject, message) are non-empty after trimming whitespace.
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      // If validation fails, display an error message to the user.
      setInlineMessage({ type: 'error', text: 'Please fill in all required fields (Name, Email, Subject, Message).' });
      return; // Stops the submission process.
    }

    try {
      // Calls the useSubmitContactMessage mutation to send the form data to the backend.
      await submitMessageMutation.mutateAsync(form);
      // If the API call is successful, display a success message to the user.
      setInlineMessage({ type: 'success', text: 'Your message has been sent successfully!' });
      
      // Conditional form clearing logic:
      if (!isAuthenticated) {
        // If the user is not authenticated, clear all form fields to prepare for a new message.
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        // If the user is authenticated, clear only the subject and message, retaining pre-filled personal details.
        setForm(prev => ({ ...prev, subject: '', message: '' }));
      }
    } catch (error: any) {
      // If the API call fails, display an error message to the user, using the API's message or a generic fallback.
      setInlineMessage({ type: 'error', text: error.message || 'Failed to send message. Please try again later.' });
    }
  }, [form, submitMessageMutation, isAuthenticated]); // Dependencies ensure the callback is updated if form data, mutation function, or auth status changes.

  return (
    // ScrollView: Provides a scrollable container for the entire page content, allowing it to adapt to different screen heights.
    <ScrollView className="flex-1 bg-gray-50">
      {/* View: Container for the main page header text. */}
      <View className="p-6">
        {/* Text: The primary heading for the Contact Us page. */}
        <Text className="font-inter text-3xl font-bold text-slate-900">Contact Us</Text>
        {/* Text: A subheading providing a friendly call to action. */}
        <Text className="mt-2 font-inter text-xl font-semibold text-brand-primary">
          Get in Touch
        </Text>
      </View>
      
      {/* Conditional rendering: Shows a button to view contact messages if the user is authenticated. */}
      {isAuthenticated && (
        <View className="p-6 pt-0">
          <TouchableOpacity
            onPress={() => router.push('/(authenticated)/contact')} // Navigates to the contact messages list page.
            className="btn-secondary w-full flex-row items-center justify-center gap-2" // Styling for a secondary button.
          >
            <MaterialIcons name="mail-outline" size={20} color="#374151" />
            <Text className="text-gray-700 font-bold text-lg">View Contact Messages</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View: Main container that orchestrates the layout for the map and store details.
          It uses flex-col (vertical stacking) by default on small screens, and flex-row (horizontal side-by-side)
          on larger screens (lg breakpoint and above), achieving a responsive design. */}
      <View className="flex flex-col lg:flex-row">
        {/* View: Container specifically for the map component.
            Its width is responsive: full width on small screens, 1/2 on large (lg), and 3/5 on extra-large (xl).
            Padding is applied around the map. */}
        <View className="w-full lg:w-1/2 xl:w-3/5 p-6">
          {/* View: Wrapper for the map itself, providing a fixed height on small screens (h-96) and
              expanding to fill available height on larger screens (lg:h-full).
              It also applies rounded corners, hides overflow, and adds a shadow for visual depth. */}
          <View className="h-96 lg:h-full w-full rounded-xl overflow-hidden shadow-lg">
            {/* Conditional rendering: Checks the current platform to decide whether to render an iframe (for web) or WebView (for native). */}
            {Platform.OS === 'web' ? (
              // iframe: HTML iframe element used to embed the Google Map on web browsers.
              <iframe
                src={mapEmbedUrl} // The URL to the Google Maps embed code.
                style={{ width: '100%', height: '100%', border: '0' }} // Ensures the iframe fills its container and has no border.
                allowFullScreen // Allows the map to be viewed in full-screen mode.
                loading="lazy" // Optimizes performance by deferring loading of the map until it's near the viewport.
                referrerPolicy="no-referrer-when-downgrade" // Specifies how much referrer information to send with network requests.
              />
            ) : (
              // WebView: React Native component to display web content (Google Map) within the native app.
              <WebView
                originWhitelist={['*']} // Allows loading of content from any origin within the WebView.
                source={{ uri: mapEmbedUrl }} // The URL to load into the WebView.
                style={{ flex: 1 }} // Ensures the WebView expands to fill the available space.
              />
            )}
          </View>
        </View>

        {/* View: Container for the store's contact details, presented as a series of DetailCard components.
            Its width is responsive: full width on small screens, 1/2 on large (lg), and 2/5 on extra-large (xl),
            complementing the map section's width. Padding is applied around the details. */}
        <View className="w-full lg:w-1/2 xl:w-2/5 p-6">
          {/* DetailCard: Displays the store's physical location. Tapping it opens a map application. */}
          <DetailCard icon="location-on" title="Location" value={storeDetails.location} url={`https://maps.google.com/?q=${storeDetails.location}`} />
          {/* DetailCard: Displays the store's email address. Tapping it opens the default email client. */}
          <DetailCard icon="email" title="Email" value={storeDetails.email} url={`mailto:${storeDetails.email}`} />
          {/* DetailCard: Displays the store's phone number. Tapping it initiates a phone call. */}
          <DetailCard icon="phone" title="Phone" value={storeDetails.phone} url={`tel:${storeDetails.phone.replace(/\s/g, '')}`} />
          {/* DetailCard: Displays Instagram handle. Tapping it navigates to the Instagram profile. */}
          <DetailCard icon="public" title="Instagram" value={storeDetails.instagram} url="https://instagram.com/appointment_client" />
          {/* DetailCard: Displays Facebook page name. Tapping it navigates to the Facebook page. */}
          <DetailCard icon="public" title="Facebook" value={storeDetails.facebook} url="https://facebook.com/AppointmentClient" />
        </View>
      </View>

      {/* View: Container for the Contact Form section. */}
      <View className="p-6">
        {/* View: Container for the section's heading and subheading, styled to be centered. */}
        <View className="mb-6 flex flex-col gap-2 items-center">
          {/* Text: A subheading for the contact form, often used as a friendly introduction. */}
          <Text className="font-inter text-3xl font-semibold text-brand-primary ">
            Get in Touch
          </Text>
          {/* Text: The main heading for the contact form section. */}
          <Text className="font-inter text-4xl font-semibold text-brand-primary">
            Send Us a Message
          </Text>
        </View>

        {/* View: The actual form container, styled using Tailwind's `auth-form` utility class. */}
        <View className="auth-form w-full">
          {/* View: Container for the "Your Name" input field, including its label. */}
          <View className="auth-field">
            {/* Text: Label for the Name input field. */}
            <Text className="label">Your Name</Text>
            {/* TextInput: Allows the user to enter their name.
                Its value is controlled by `form.name` state.
                `editable` is conditional, preventing changes if the user is authenticated and their name is pre-filled. */}
            <TextInput
              value={form.name} // Binds input to the 'name' property of the form state.
              onChangeText={(text) => handleInputChange('name', text)} // Updates 'name' in form state.
              placeholder="Enter your name" // Hint text.
              className="input" // Styling from Tailwind utility classes.
              editable={!isAuthenticated} // Controls if the input can be edited.
            />
          </View>

          {/* View: Container for the "Your Email" input field and its label. */}
          <View className="auth-field">
            {/* Text: Label for the Email input field. */}
            <Text className="label">Your Email</Text>
            {/* TextInput: Allows the user to enter their email address.
                Pre-filled and not editable if the user is authenticated.
                `keyboardType` is set to 'email-address' for appropriate soft keyboard layout. */}
            <TextInput
              value={form.email} // Binds input to the 'email' property of the form state.
              onChangeText={(text) => handleInputChange('email', text)} // Updates 'email' in form state.
              placeholder="Enter your email" // Hint text.
              keyboardType="email-address" // Configures keyboard for email entry.
              className="input" // Styling.
              editable={!isAuthenticated} // Controls editability.
            />
          </View>

          {/* View: Container for the "Your Phone (Optional)" input field and its label. */}
          <View className="auth-field">
            {/* Text: Label for the Phone input field, explicitly marked as optional. */}
            <Text className="label">Your Phone (Optional)</Text>
            {/* TextInput: Allows the user to enter their phone number.
                `keyboardType` is set to 'phone-pad' for numeric input. */}
            <TextInput
              value={form.phone} // Binds input to the 'phone' property of the form state.
              onChangeText={(text) => handleInputChange('phone', text)} // Updates 'phone' in form state.
              placeholder="Enter your phone number" // Hint text.
              keyboardType="phone-pad" // Configures keyboard for phone number entry.
              className="input" // Styling.
            />
          </View>

          {/* View: Container for the "Subject" input field and its label. */}
          <View className="auth-field">
            {/* Text: Label for the Subject input field. */}
            <Text className="label">Subject</Text>
            {/* TextInput: Allows the user to enter the subject of their message. */}
            <TextInput
              value={form.subject} // Binds input to the 'subject' property of the form state.
              onChangeText={(text) => handleInputChange('subject', text)} // Updates 'subject' in form state.
              placeholder="Subject of your message" // Hint text.
              className="input" // Styling.
            />
          </View>

          {/* View: Container for the "Message" input field and its label. */}
          <View className="auth-field">
            {/* Text: Label for the Message input field. */}
            <Text className="label">Message</Text>
            {/* TextInput: Allows the user to enter their message.
                `multiline` enables multiple lines, `numberOfLines` sets initial height,
                and `textAlignVertical` ensures text starts at the top for multiline inputs. */}
            <TextInput
              value={form.message} // Binds input to the 'message' property of the form state.
              onChangeText={(text) => handleInputChange('message', text)} // Updates 'message' in form state.
              placeholder="Your message" // Hint text.
              multiline // Enables multi-line text input.
              numberOfLines={4} // Sets the initial height of the input to show 4 lines.
              className="input min-h-[100px] pt-3" // Styling, including a minimum height.
              textAlignVertical="top" // Ensures text starts from the top of the multiline input.
            />
          </View>

          {/* Conditional rendering: Displays an inline message (success or error) if `inlineMessage` state is not null. */}
          {inlineMessage && (
            // View: Alert container, dynamically styled based on the message type (`alert-success` or `alert-error`).
            <View className={`alert ${inlineMessage.type === 'success' ? 'alert-success' : 'alert-error'} mt-4`}>
              {/* Text: Displays the actual success or error message to the user. */}
              <Text className={`${inlineMessage.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                {inlineMessage.text}
              </Text>
            </View>
          )}

          {/* TouchableOpacity: The submit button for the contact form. */}
          <TouchableOpacity
            onPress={handleSubmit} // Triggers the `handleSubmit` function when pressed.
            disabled={submitMessageMutation.isPending} // The button is disabled while the message is being sent (mutation is pending).
            className={`btn-primary w-full mt-6 ${submitMessageMutation.isPending ? 'opacity-50' : ''}`} // Styling, including reduced opacity when disabled.
          >
            {/* Conditional rendering: Displays an `ActivityIndicator` (loading spinner) if the mutation is pending,
                otherwise displays the "Send Message" text. */}
            {submitMessageMutation.isPending ? (
              // ActivityIndicator: Shows a loading spinner in the button while the form is submitting.
              <ActivityIndicator color="white" />
            ) : (
              // Text: The label for the submit button.
              <Text className="text-white font-bold text-lg">Send Message</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}