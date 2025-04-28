"use client"
import { AccordionItem, Button, Chip, DatePicker, Input, Textarea, TimeInput } from '@heroui/react'
import React, { useState } from 'react'

const CreateInterviewAccordionOne = () => {
    const [selectedType, setSelectedType] = useState<string[]>([]);
  return (
    <AccordionItem
        key="1"
        aria-label="Accordion 1"
        title="Accordion 1"
        className="text-white border-white"
      >
        <div className="space-y-4">
        <Input label="Interview Profile" placeholder="e.g. Frontend Developer" variant='bordered' />
        <Textarea label="Job Description" placeholder="Describe the role..." />

        <div>
          <p className="font-medium mb-2">Type of Interview</p>
          <div className="flex gap-2 flex-wrap">
            {["Technical", "Behavioral", "Problem Solving", "Mixed"].map((type) => (
              <Chip
                key={type}
                color={selectedType.includes(type) ? "primary" : "default"}
                variant={selectedType.includes(type) ? "solid" : "bordered"}
                // onClick={() => handleChipClick(type)}
                className="cursor-pointer"
              >
                {type}
              </Chip>
            ))}
          </div>
        </div>

        <Input
          type="number"
          label="Interview Duration (in minutes)"
          placeholder="e.g. 30"
        />

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <DatePicker label="Interview Start Date" />
            <TimeInput label="Start Time" className="mt-2" />
          </div>
          <div className="flex-1">
            <DatePicker label="Interview Expiry Date" />
            <TimeInput label="Expiry Time" className="mt-2" />
          </div>
        </div>

        <Button color="primary" className="mt-4">
          Generate
        </Button>
      </div>
      </AccordionItem>
  )
}

export default CreateInterviewAccordionOne