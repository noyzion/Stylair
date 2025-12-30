import { Modal, StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  uploadPhotoButton: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  photoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 26,
  },
  uploadPhotoText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  dividerText: {
    textAlign: 'center',
    marginVertical: 14,
    color: '#1A1A1A',      
    fontSize: 17,
    fontWeight: '500',
    marginTop: 8,
  },
  imageCard: {
    height: 320,
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 30,
    borderRadius: 32,
    backgroundColor: 'rgba(240, 230, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.15,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBackgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(240, 230, 255, 0.3)',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnCardsUserChoice: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 230, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  optionSelected: {
    backgroundColor: 'rgba(240, 230, 255, 0.60)',
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F8',
  },
  iconContainerSelected: {
    backgroundColor: 'rgb(108, 99, 255)',
  },
  choiceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
  },
  manualFormContainer: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 230, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 14,
    color: '#1A1A1A',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    backgroundColor: 'rgba(240, 230, 255, 0.30)',
  },
  
  chipSelected: {
    backgroundColor: 'rgba(108, 99, 255, 0.8)',
    borderColor: 'rgb(108, 99, 255)',
  },
  
  chipText: {
    fontSize: 13,
    color: '#111',
  },
  
  chipTextSelected: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  pickerContainer: {
    marginVertical: 20,
    height: 200,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 200,
  },
  pickerItem: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  modalClose: {
    textAlign: 'center',
    color: 'rgb(108, 99, 255)',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalDone: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgb(108, 99, 255)',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 0,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  aiCard: {
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(240, 230, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  aiIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  
  aiDescription: {
    fontSize: 13,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 16,
    gap: 8,
    marginTop: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  aiButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  addColorStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(108, 99, 255)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignSelf: 'flex-start', 
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFFD',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  
  colorChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginRight: 6,
  },
  homeButton: {
    position: 'absolute',
    top: 76,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 75,
    resizeMode: 'contain',
  },
});