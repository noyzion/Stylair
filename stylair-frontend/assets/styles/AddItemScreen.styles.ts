import { Modal, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    fontFamily: 'Manrope-bold',
    fontSize: 25,            
    fontWeight: '700',
    color: 'rgb(108, 99, 255)',
    marginTop: 70,
    marginBottom: 10,
    textAlign: 'center',
  },
  uploadPhotoButton: {
    backgroundColor: 'rgb(108, 99, 255)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 20,        
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
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
    marginTop: 22,
  },
  imageCard: {
    height: 280,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.30,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  
    overflow: 'hidden',
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
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnCardsUserChoice: {
    marginTop: 10,
    paddingHorizontal: 20,
    gap: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 32, 
    
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  optionSelected: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderColor: 'rgb(108, 99, 255)',
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
    marginTop: 26,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 32,
  
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
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
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  chipSelected: {
    backgroundColor: 'rgb(108, 99, 255)',
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
  
  modalClose: {
    textAlign: 'center',
    color: 'rgb(108, 99, 255)',
    marginTop: 10,
    fontSize: 16,
  },
  modalDone: {
    marginTop: 16,
    alignSelf: 'center',
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
    marginTop: 24,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: 'rgb(108, 99, 255)',
    alignItems: 'center',
    justifyContent: 'center',
  },  
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  
});
