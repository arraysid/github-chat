"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createProjectInputValidation } from "@/server/validation/project.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FaGithub, FaKey, FaProjectDiagram } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import * as z from "zod";
import { useCreateProject } from "../_hooks/use-create-project";

export function CreateProjectForm() {
  const form = useForm<z.infer<typeof createProjectInputValidation>>({
    resolver: zodResolver(createProjectInputValidation),
    defaultValues: {
      name: "",
      url: "",
      token: "",
    },
  });

  const { mutate, isPending } = useCreateProject();

  function onSubmit(values: z.infer<typeof createProjectInputValidation>) {
    mutate(values);
    form.reset();
  }

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      className="w-full max-w-md space-y-6"
    >
      <div className="space-y-2 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight"
        >
          Connect Repository
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-muted-foreground text-sm"
        >
          Link your GitHub repository to get started
        </motion.p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Project Name
                  </FormLabel>
                  <div className="relative">
                    <FaProjectDiagram className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                    <Input
                      placeholder="Enter project name"
                      {...field}
                      className="h-10 pl-10"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.error && (
                    <FormMessage className="flex items-center gap-1 text-xs text-red-600">
                      <FiAlertCircle className="flex-shrink-0" />
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="url"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Repository URL
                  </FormLabel>
                  <div className="relative">
                    <FaGithub className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                    <Input
                      placeholder="https://github.com/username/repo"
                      {...field}
                      className="h-10 pl-10"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.error && (
                    <FormMessage className="flex items-center gap-1 text-xs text-red-600">
                      <FiAlertCircle className="flex-shrink-0" />
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="token"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    GitHub Token (Optional)
                  </FormLabel>
                  <div className="relative">
                    <FaKey className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
                    <Input
                      type="password"
                      placeholder="Enter your GitHub token"
                      {...field}
                      className="h-10 pl-10"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.error && (
                    <FormMessage className="flex items-center gap-1 text-xs text-red-600">
                      <FiAlertCircle className="flex-shrink-0" />
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="submit"
              className="h-10 w-full font-semibold"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Project"}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
