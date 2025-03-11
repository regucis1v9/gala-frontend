import React, { useState, useEffect } from "react";
import { ScrollArea, Stack, Group, Box, Modal, Button, Textarea, SegmentedControl, Text, ColorPicker, Popover, Tooltip, useMantineColorScheme } from "@mantine/core";
import { useViewportSize, useElementSize, useDisclosure } from "@mantine/hooks";
import { useDispatch, useSelector } from "react-redux";
import { setButtonsData, updateImageDescription, updateTextColor, updateBgColor, updateTextPosition  } from "../../actions/imageActions";
import ViewFoldersModal from "../Folders/ViewFoldersModal";
import SlideshowModal from "./SlideshowModal";
import classes from "../../style/SlidesCreation.module.css";
import position from "../../style/DescriptionPosition.module.css"
import description from "../../style/SlideDescription.module.css";
import { IconX, IconCirclePlusFilled, IconArrowRight, IconPlus } from "@tabler/icons-react";
import {showNotification, updateNotification} from "@mantine/notifications";


export default function SlideshowCreation() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const { height: viewportHeight, width: viewportWidth } = useViewportSize();
    const { ref, width: containerWidth } = useElementSize();
    const { previewRef } = useElementSize();
    const { mainRef, mainWidth, mainHeight } = useElementSize();

    const [openedSelect, { open: openSelect, close: closeSelect }] = useDisclosure(false);
    const [openedContinue, { open: openContinue, close: closeContinue }] = useDisclosure(false);

    const dispatch = useDispatch();
    const buttonsData = useSelector((state) => state.imageLinks || []);

    const [nextId, setNextId] = useState(1);
    const [selectedButtonId, setSelectedButtonId] = useState(buttonsData[0]?.id || 1);

    const [verticalPosition, setVerticalPosition] = useState('Vidū');
    const [horizontalPosition, setHorizontalPosition] = useState('Pa vidu'); 
    
    const [textValue, onTextChange] = useState('rgba(255, 255, 255, 1)');
    const [bgValue, onBgChange] = useState('rgba(40,34,98,1)');

    const hasImageLink = buttonsData.some(button => button.imageLink.trim() !== "");

    useEffect(() => {
        if (!Array.isArray(buttonsData) || buttonsData.length === 0) {
            const initialButton = { id: nextId, imageLink: "", description: "", textColor: 'rgba(255, 255, 255, 1)', bgColor: 'rgba(40,34,98,1)', textPosition: "" };
            dispatch(setButtonsData([initialButton]));
            setNextId((prevId) => prevId + 1);
        }
    }, [buttonsData, dispatch, nextId]);
    
    useEffect(() => {
        const selectedButton = buttonsData.find(button => button.id === selectedButtonId);
        
        if (selectedButton) {
            onTextChange(selectedButton.textColor || 'rgba(255, 255, 255, 1)'); 
            onBgChange(selectedButton.bgColor || 'rgba(40,34,98,1)');          
        }
    }, [selectedButtonId, buttonsData]);
    

    const handleTextColorChange = (value) => {
        onTextChange(value);
        dispatch(updateTextColor(selectedButtonId, value)); 
      };
    
      const handleBgColorChange = (value) => {
        onBgChange(value);
        dispatch(updateBgColor(selectedButtonId, value)); 
      };
      
    const addButton = () => {
        const newButton = { id: nextId, imageLink: "", description: "",textColor: 'rgba(255, 255, 255, 1)', bgColor: 'rgba(40,34,98, 1)', textPosition: "middle-center" };
        dispatch(setButtonsData([...(buttonsData || []), newButton]));
        setSelectedButtonId(newButton.id);
        setNextId((prevId) => prevId + 1);
    };

    const removeButton = (id) => {
        if (!Array.isArray(buttonsData) || buttonsData.length === 1) {
            return;
        }

        const updatedButtons = buttonsData.filter((button) => button.id !== id);
        dispatch(setButtonsData(updatedButtons));

        if (id === selectedButtonId) {
            const nextIndex = updatedButtons.findIndex((button) => button.id === id) + 1;
            const newSelectedButton = updatedButtons[nextIndex] || updatedButtons[updatedButtons.length - 1];
            setSelectedButtonId(newSelectedButton.id);
        }
    };

    const handleButtonClick = (id) => {
        setSelectedButtonId(id);
    };

    const handleDescriptionChange = (event) => {
        const newDescription = event.target.value;
        dispatch(updateImageDescription(selectedButtonId, newDescription));
    };

    const selectedButtonIndex = Array.isArray(buttonsData)
        ? buttonsData.findIndex((button) => button.id === selectedButtonId)
        : -1;

    const availableWidth = viewportWidth - containerWidth;
    const selectedImage = buttonsData.find((button) => button.id === selectedButtonId)?.imageLink || "";
    const selectedImageDescription = buttonsData.find((button) => button.id === selectedButtonId)?.description || "";


    const handleVerticalPositionChange = (value) => {
        setVerticalPosition(value);
        const newPositionClass = `${value === 'Augšā' ? 'top' : value === 'Apakšā' ? 'bottom' : 'middle'}-${horizontalPosition === 'Pa kreisi' ? 'left' : horizontalPosition === 'Pa labi' ? 'right' : 'center'}`;
        dispatch(updateTextPosition(selectedButtonId, newPositionClass)); 
    };
    
    const handleHorizontalPositionChange = (value) => {
        setHorizontalPosition(value);
        const newPositionClass = `${verticalPosition === 'Augšā' ? 'top' : verticalPosition === 'Apakšā' ? 'bottom' : 'middle'}-${value === 'Pa kreisi' ? 'left' : value === 'Pa labi' ? 'right' : 'center'}`;
        dispatch(updateTextPosition(selectedButtonId, newPositionClass)); 
    };
    
    const getDescriptionContainerClass = () => {
        let positionClass = '';
    
        if (verticalPosition === 'Augšā') {
            positionClass += 'top';
        } else if (verticalPosition === 'Apakšā') {
            positionClass += 'bottom';
        } else {
            positionClass += 'middle';
        }
    
        positionClass += '-';

        if (horizontalPosition === 'Pa kreisi') {
            positionClass += 'left';
        } else if (horizontalPosition === 'Pa labi') {
            positionClass += 'right';
        } else {
            positionClass += 'center';
        }
    
        return positionClass;
    };
    useEffect(() => {
        const positionClass = getDescriptionContainerClass();
        dispatch(updateTextPosition(selectedButtonId, positionClass));
    }, [verticalPosition, horizontalPosition, dispatch]);
    

    return (
        <div className="slideshow-create-main" ref={mainRef}>
            <span className="scroll-area">
                <Button 
                onClick={addButton}
                style={{ marginBottom: 10 }} 
                w={200} 
                rightSection={<IconPlus stroke={2} size={20} />}>
                    Pievienot Slaidu
                </Button>
                <ScrollArea offsetScrollbars  type="scroll" w={mainWidth} h={150}>
                    <Group ref={ref} width={viewportWidth} gap="md" wrap={"nowrap"}>
                        {Array.isArray(buttonsData) &&
                            buttonsData.map((button) => (
                                <span className="preview-wrapper" key={button.id}>
                                    <div
                                        ref={previewRef}
                                        style={{
                                            position: "relative",
                                            width: 200,
                                        }}
                                    >
                                            <Button
                                                w={200}
                                                h={112.5}
                                                onClick={() => handleButtonClick(button.id)}
                                                variant="outline"
                                                classNames={{ root: colorScheme === 'light' ? classes.root : classes.darkRoot }}
                                                style={{
                                                    border: button.id === selectedButtonId ? "3px solid #282262" : "none",
                                                }}
                                            >
                                            { button.imageLink && <img className="slide-preview-image" src={button.imageLink || ""} alt="" />}
                                        </Button>
                                        <Button
                                            variant="light"
                                            color="gray"
                                            onClick={() => removeButton(button.id)}
                                            style={{
                                                position: "absolute",
                                                top: 10,
                                                right: 10,
                                                fontSize: 16,
                                                width: 24,
                                                height: 24,
                                                padding: 0,
                                                fontWeight: "bold",
                                                zIndex: 4,
                                            }}
                                            
                                        >
                                            <IconX style={{ width: 20, height: 20 }} color="gray" stroke={2} />
                                        </Button>
                                    </div>
                                </span>
                            ))}
                    </Group>
                </ScrollArea>
            </span>
            <Box
                h={viewportHeight}
                gap="md"
                justify="center"
                align="center"
                direction="column"
                wrap="wrap"
                ml={10}
            >
                <div className="aspect-ratio">
                    <span className="full">
                    {selectedImage && selectedImageDescription.trim() && (
                        <div 
                            className={`description-container ${buttonsData.find((button) => button.id === selectedButtonId)?.textPosition || ''}`} 
                            style={{
                                color: textValue,
                                backgroundColor: bgValue, 
                                zIndex: 10 //
                            }}
                        >
                            {selectedImageDescription}
                        </div>
                    )}
                    <Button onClick={openSelect} classNames={{ root: colorScheme === 'light' ? classes.root : classes.darkRoot }} >
                        <span className="z4 big">{selectedImage ? "" : <span className="image-selector-text"><IconCirclePlusFilled style={{ width: 100, height: 100 }} color="gray" stroke={1} /> Izvēlēties failu</span>}</span>
                        {selectedImage && 
                            <img className="slide-preview-image" src={selectedImage} alt="Kļūda atlasot bildi" />
                        }
                    </Button>
                    </span>
                        {selectedImage ? (
                            <Textarea
                                classNames={{ root: description.wrapper, description: description.description, label: description.label }}
                                variant="filled"
                                label="Apraksts"
                                description={selectedImage ? "Nav obligāts" : "Sākumā jāizvēlas fails"}
                                placeholder="Apraksts par slaidā redzamo"
                                autosize
                                minRows={2}
                                maxRows={4}
                                value={selectedImageDescription}
                                onChange={handleDescriptionChange}
                                disabled={!selectedImage}
                            />
                            ) : (
                            <Tooltip label="Jāizvēlas fails pirms var pievienot aprakstu!">
                                <Textarea
                                    classNames={{ root: description.wrapper, description: description.description, label: description.label }}
                                    variant="filled"
                                    label="Apraksts"
                                    description={selectedImage ? "Nav obligāts" : "Sākumā jāizvēlas fails"}
                                    placeholder="Apraksts par slaidā redzamo"
                                    autosize
                                    minRows={2}
                                    maxRows={4}
                                    value={selectedImageDescription}
                                    onChange={handleDescriptionChange}
                                    disabled={!selectedImage}
                                />
                            </Tooltip>
                            )}
                    <Text classNames={{ root: description.wrapper }} size="sm" fw={500} mb={3}>
                        Teksta atrašanās vieta
                    </Text>
                    <Group justify="space-between">
                        <Stack gap="xs" classNames={{root: position.stack1}}>
                            {selectedImageDescription ? (
                                <SegmentedControl
                                    data={['Augšā', 'Vidū', 'Apakšā']}
                                    value={verticalPosition}
                                    onChange={handleVerticalPositionChange}
                                    disabled={false}
                                />
                                ) : (
                                <Tooltip label="Sākumā jāievada teksts, pirms norāda tā pozīciju!">
                                    <SegmentedControl
                                        data={['Augšā', 'Vidū', 'Apakšā']}
                                        value={verticalPosition}
                                        onChange={handleVerticalPositionChange}
                                        disabled={true}
                                    />
                                </Tooltip>
                            )}
                            {selectedImageDescription ? (
                                <SegmentedControl
                                    data={['Pa kreisi', 'Pa vidu', 'Pa labi']}
                                    value={horizontalPosition}
                                    onChange={handleHorizontalPositionChange}
                                    disabled={false}
                                />
                                ) : (
                                <Tooltip label="Sākumā jāievada teksts, pirms norāda tā pozīciju!">
                                    <SegmentedControl
                                        data={['Pa kreisi', 'Pa vidu', 'Pa labi']}
                                        value={horizontalPosition}
                                        onChange={handleHorizontalPositionChange}
                                        disabled={true}
                                    />
                                </Tooltip>
                            )}
                        </Stack>
                        <Stack gap="xs" classNames={{root: position.stack2}}>
                            <Group justify="flex-end" h={40} classNames={{root: position.maxContent}}>
                                <Text ta="left"size="sm" fw={500} w={150}>Teksta krāsa</Text>
                                <Popover position="left" clickOutsideEvents={['mouseup', 'touchend']}>
                                    <Popover.Target>
                                    {!selectedImageDescription ? (
                                        <Tooltip label="Sākumā jāievada teksts, pirms norāda tā krāsu!">
                                            <Button opacity={0.5} miw={0} bg={textValue}  w={50} h={25} disabled={!selectedImage} style={{ border: '1px solid black' }}></Button>
                                        </Tooltip>
                                    ) : (
                                        <Button miw={0} bg={textValue}  w={50} h={25} disabled={!selectedImage} style={{ border: '1px solid black' }}></Button>
                                    )}
                                    </Popover.Target>
                                    <Popover.Dropdown >
                                        <ColorPicker
                                        disabled={!textValue}
                                         value={textValue}
                                         onChange={handleTextColorChange}
                                         format="rgba"
                                         withPicker
                                         swatches={['#2e2e2e', '#868e96','#ffffff', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                                        ></ColorPicker>
                                    </Popover.Dropdown>
                                </Popover>
                            </Group>
                            <Group justify="flex-end" h={40} classNames={{root: position.maxContent}}>
                                <Text ta="left" size="sm" fw={500} w={150}>Teksta fona krāsa</Text>
                                <Popover position="left" clickOutsideEvents={['mouseup', 'touchend']}>
                                    <Popover.Target>
                                        {!selectedImageDescription ? (
                                        <Tooltip label="Sākumā jāievada teksts, pirms norāda tā fona krāsu!">
                                            <Button opacity={0.5} miw={0} bg={bgValue}  w={50} h={25} disabled={!selectedImage} style={{ border: '1px solid black' }}></Button>
                                        </Tooltip>
                                        ) : (
                                            <Button miw={0} bg={bgValue}  w={50} h={25} disabled={!selectedImage} style={{ border: '1px solid black' }}></Button>
                                        )}                                       
                                    </Popover.Target>
                                    <Popover.Dropdown>
                                        <ColorPicker
                                        disabled={!textValue}
                                         value={bgValue}
                                         withPicker
                                         onChange={handleBgColorChange}
                                         format="rgba"
                                         swatches={['#2e2e2e', '#868e96','#ffffff', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
                                        ></ColorPicker>
                                    </Popover.Dropdown>
                                </Popover>
                            </Group>
                        </Stack>
                    </Group>
                    {hasImageLink ? (
                        <Tooltip label="Slaidi bez faila netiks pievienoti!">
                            <Button
                                onClick={openContinue}
                                mt={12} 
                                color="blue"
                                disabled={!hasImageLink}
                                rightSection={<IconArrowRight size={14} />}
                            >
                                Turpināt
                            </Button>
                        </Tooltip>
                        ) : (
                        <Tooltip label="Jāizveido vismaz viens slaids pirms turpināšanas!">
                            <Button
                                mt={12} 
                                color="blue"
                                disabled={!hasImageLink}
                                rightSection={<IconArrowRight size={14} />}
                             >
                                Turpināt
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </Box>
            <Modal
                opened={openedSelect}
                onClose={closeSelect}
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                fullScreen
            >
                <ViewFoldersModal selectedButtonId={selectedButtonId} closeModal={closeSelect} />
            </Modal>
            <Modal
                title="Ekrānu un laika norādīšana"
                w={300}
                opened={openedContinue}
                onClose={closeContinue}
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                centered
            >
                <SlideshowModal closeContinue={closeContinue}></SlideshowModal>
            </Modal>
        </div>
    );
}
