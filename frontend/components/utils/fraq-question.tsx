"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
    {
        question: "MoneyMind là gì?",
        answer: "MoneyMind là ứng dụng quản lý chi tiêu cá nhân thông minh, cho phép bạn ghi nhận giao dịch bằng ngôn ngữ tự nhiên (ví dụ: 'ăn phở 50k trưa nay'), AI sẽ tự động phân loại và lưu trữ.",
    },
    {
        question: "Tính năng nhập bằng ngôn ngữ tự nhiên hoạt động thế nào?",
        answer: "Bạn chỉ cần gõ câu như bình thường, ví dụ 'grab đi làm 30k' hoặc 'lương tháng 6 là 20tr'. AI sẽ tự nhận diện số tiền, loại giao dịch (thu/chi), danh mục và ngày tháng, rồi auto-fill vào form để bạn xác nhận.",
    },
    {
        question: "Dữ liệu tài chính của tôi có được bảo mật không?",
        answer: "Có. Mọi dữ liệu được mã hóa, xác thực bằng JWT token, và mỗi người dùng chỉ có thể truy cập dữ liệu của chính mình. Backend deploy trên GCP Cloud Run với các tiêu chuẩn bảo mật cao.",
    },
    {
        question: "Ứng dụng có miễn phí không?",
        answer: "Hoàn toàn miễn phí cho tất cả tính năng cốt lõi: ghi nhận giao dịch, quản lý ngân sách, báo cáo biểu đồ và nhập bằng ngôn ngữ tự nhiên.",
    },
    {
        question: "Tôi có thể quản lý nhiều ví không?",
        answer: "Có. MoneyMind hỗ trợ đa ví: tiền mặt, tài khoản ngân hàng, ví điện tử, thẻ tín dụng. Mỗi giao dịch có thể gắn với một ví cụ thể và số dư được cập nhật tự động.",
    },
]

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="relative py-24 bg-white overflow-hidden">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
                    className="text-center mb-12"
                >
                    <motion.span
                        className="font-mono text-emerald-500 text-xs tracking-widest inline-block"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        HỖ TRỢ
                    </motion.span>
                    <h2 className="text-3xl md:text-5xl font-black text-[#121212] tracking-tighter mt-2">
                        CÂU HỎI THƯỜNG GẶP
                    </h2>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-emerald-100 rounded-2xl overflow-hidden bg-white shadow-sm"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left group"
                            >
                                <span className="text-lg font-bold text-[#121212] group-hover:text-emerald-500 transition-colors">
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-emerald-500" />
                                ) : (
                                    <ChevronDown className="text-[#121212]/40 group-hover:text-emerald-500" />
                                )}
                            </button>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="px-6 pb-5 text-[#121212]/60 font-mono text-sm leading-relaxed"
                                >
                                    {faq.answer}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
